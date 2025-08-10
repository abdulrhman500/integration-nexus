import binascii
import datetime
import os
import secrets
import random
import base64
import json
from typing import Any, Dict, List

from dtos.integration_item import IntegrationItem
import httpx  # type: ignore
from fastapi import Request, HTTPException, status

from config.constants import HTTP_METHODS, HUBSPOT_CONSTS, HTTP_CONTENT_TYPE
from config.logger_config import logger
from dtos.hubspot_dtos import HubSpotTokenResponseDTO
from utils.http_client import fetch, build_url_with_params
from utils.redis.redis_client import redis_client


class HubspotService:

    def __init__(self) -> None:
        self.client_id: str | None = os.getenv("HUBSPOT_CLIENT_ID")
        self.client_secret: str | None = os.getenv("HUBSPOT_CLIENT_SECRET")
        self.redirect_uri: str | None = os.getenv("HUBSPOT_CALLBACK_ENDPOINT")

        if not all([self.client_id, self.client_secret, self.redirect_uri]):
            logger.error("one or more HubSpot OAuth environment variable(s) is missing")
            raise Exception("OAuth environment configuration error")

    async def handle_oauth2callback(self, code: str, state: str):
        state_from_callback = self._decode_state_token(state)
        org_id = state_from_callback.get("org_id")
        user_id = state_from_callback.get("user_id")
        nonce_from_callback = state_from_callback.get("nonce")

        if not (org_id and user_id and nonce_from_callback):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, "State is missing required fields."
            )

        nonce_key = redis_client.KeyNamer.get_state_token_key(
            org_id, user_id, HUBSPOT_CONSTS.INTEGRATION_NAME
        )
        stored_nonce = await redis_client.get_key(nonce_key)
        if not stored_nonce or stored_nonce != nonce_from_callback:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "State validation failed. CSRF suspected."
            )

        await redis_client.delete_key(nonce_key)

        hubspot_token_response: HubSpotTokenResponseDTO = await self._get_access_token(
            code
        )

        access_token_key = redis_client.KeyNamer.get_access_token_key(
            org_id, user_id, HUBSPOT_CONSTS.INTEGRATION_NAME
        )
        refresh_token_key = redis_client.KeyNamer.get_refresh_token_key(
            org_id, user_id, HUBSPOT_CONSTS.INTEGRATION_NAME
        )

        await redis_client.add_key(
            access_token_key,
            hubspot_token_response.access_token,
            expire_seconds=hubspot_token_response.expires_in,
        )
        await redis_client.add_key(
            refresh_token_key, hubspot_token_response.refresh_token
        )

    async def handle_authorize(self, org_id: str, user_id: str):
        state_token, nonce = self._generate_state_token(org_id, user_id)

        nonce_key = redis_client.KeyNamer.get_state_token_key(
            org_id, user_id, HUBSPOT_CONSTS.INTEGRATION_NAME
        )
        await redis_client.add_key(nonce_key, nonce, expire_seconds=600)  # 10 min

        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": HUBSPOT_CONSTS.SCOPES,
            "state": state_token,
        }
        return build_url_with_params(
            HUBSPOT_CONSTS.USER_AUTHORIZATION_REDIRECT_URL, params
        )

    async def get_credentials(self, org_id: str, user_id: str) -> str | None:
        access_token_key = redis_client.KeyNamer.get_access_token_key(
            org_id, user_id, HUBSPOT_CONSTS.INTEGRATION_NAME
        )
        return await redis_client.get_key(access_token_key)

    async def _get_access_token(self, code: str) -> HubSpotTokenResponseDTO:
        data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
            "code": code,
        }
        hubspot_token_response = await fetch(
            HTTP_METHODS.POST,
            HUBSPOT_CONSTS.TOKEN_URL,
            headers={"content-type": "application/x-www-form-urlencoded"},
            body=data,
        )
        return HubSpotTokenResponseDTO.model_validate(hubspot_token_response)

    def _generate_state_token(self, org_id: str, user_id: str) -> tuple[str, str]:
        nonce = secrets.token_hex(16)
        state_data = {"org_id": org_id, "user_id": user_id, "nonce": nonce}
        json_string = json.dumps(state_data)
        base64_bytes = base64.urlsafe_b64encode(json_string.encode("utf-8"))
        state_token = base64_bytes.decode("utf-8")
        return state_token, nonce

    def _decode_state_token(self, state_token: str) -> dict:
        try:
            base64_bytes = state_token.encode("utf-8")
            # base64 string must be padded to a multiple of 4
            padded_bytes = base64_bytes + b'=' * (-len(base64_bytes) % 4)
            json_bytes = base64.urlsafe_b64decode(padded_bytes)
            return json.loads(json_bytes.decode("utf-8"))
        except (binascii.Error, json.JSONDecodeError, UnicodeDecodeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or malformed state parameter."
            )

    async def get_items(self, org_id: str, user_id: str) -> list[IntegrationItem]:
        """
        Fetche a list of contacts from HubSpot and check if the access token is expired and does refresh if needed
        """
        access_token = await self.get_credentials(org_id, user_id)
        if not access_token:
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "No HubSpot credentials found for this user.",
            )

        try:
            return await self._fetch_contacts_with_token(access_token)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                logger.info("Access token expired or invalid. Attempting to refresh.")
                try:
                    new_access_token = await self._refresh_access_token(org_id, user_id)
                    logger.info("Token refreshed successfully. Retrying the API call.")
                    return await self._fetch_contacts_with_token(new_access_token)
                except Exception as refresh_error:
                    logger.error(f"Failed to refresh HubSpot token: {refresh_error}")
                    raise HTTPException(
                        status.HTTP_401_UNAUTHORIZED,
                        "Could not refresh token. Please re-authenticate.",
                    )
            else:
                raise e

    async def _fetch_contacts_with_token(self, access_token: str) -> list:
        params = {
            "limit": 10,
            "archived": "false",
            "properties": "firstname,lastname,email,company,website",
        }
        headers = {"Authorization": f"Bearer {access_token}"}
        contacts_response = await fetch(
            method=HTTP_METHODS.GET,
            url=HUBSPOT_CONSTS.CONTACTS_API_URL,
            params=params,
            headers=headers,
            content_type=HTTP_CONTENT_TYPE.JSON,
        )
        contacts = contacts_response.get("results", [])
        return self._create_integration_item_metadata_object(contacts)

    async def _refresh_access_token(self, org_id: str, user_id: str) -> str:

        refresh_token_key = redis_client.KeyNamer.get_refresh_token_key(
            org_id, user_id, HUBSPOT_CONSTS.INTEGRATION_NAME
        )
        refresh_token = await redis_client.get_key(refresh_token_key)

        if not refresh_token:
            raise Exception("No refresh token found to perform the refresh")

        data = {
            "grant_type": "refresh_token",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
        }

        token_response_data = await fetch(
            method=HTTP_METHODS.POST,
            url=HUBSPOT_CONSTS.TOKEN_URL,
            body=data,
            headers={"content-type": "application/x-www-form-urlencoded"},
        )

        new_tokens = HubSpotTokenResponseDTO.model_validate(token_response_data)

        access_token_key = redis_client.KeyNamer.get_access_token_key(
            org_id, user_id, HUBSPOT_CONSTS.INTEGRATION_NAME
        )
        await redis_client.add_key(
            access_token_key,
            new_tokens.access_token,
            expire_seconds=new_tokens.expires_in,
        )
        await redis_client.add_key(refresh_token_key, new_tokens.refresh_token)

        return new_tokens.access_token

    def _create_integration_item_metadata_object(
        self,
        response_json: List[Dict[str, Any]],
    ) -> List[IntegrationItem]:

        integration_items = []
        for contact in response_json:
            properties = contact.get("properties", {})

            def parse_date(date_string: str | None) -> datetime.datetime | None:
                if not date_string:
                    return None
                try:
                    return datetime.datetime.fromisoformat(date_string.replace("Z", "+00:00"))
                except (ValueError, TypeError):
                    return None

            item = IntegrationItem(
                id=contact.get("id"),
                name=f"{properties.get('firstname', '')} {properties.get('lastname', '')}".strip(),
                type="hubspot_contact",
                directory=False,
                creation_time=parse_date(properties.get("createdate")),
                last_modified_time=parse_date(properties.get("lastmodifieddate")),
                visibility=not contact.get("archived", False),
            )
            integration_items.append(item)

        return integration_items


hubspot_service = HubspotService()
