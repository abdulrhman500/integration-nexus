from utils.http_client import fetch
from config.constants import HTTP_METHODS
import os
from config.logger_config import logger
from dtos.hubspot_dtos import HubSpotTokenResponseDTO
from utils.redis.redis_client import RedisClient
from utils.http_client import build_url_with_params
import secrets, random
import base64
import json
from config.constants import HUBSPOT_CONSTS


class HubspotService:

    def __init__(self) -> None:
        self.client_id: str | None = os.getenv("HUBSPOT_CLIENT_ID")
        self.client_secret: str | None = os.getenv("HUBSPOT_CLIENT_SECRET")

        if not all([self.client_id, self.client_secret]):
            logger.error(
                f"one or more HubSpot OAuth environment variable(s) is missing"
            )
            raise Exception("OAuth environment configuration error")

    async def handle_oauth2callback(self, code: str, state: str):

        state_object = await HubspotService.decode_state_token(state)
        
        org_id = state_object["org_id"]
        user_id = state_object["user_id"]
        if(not(org_id and user_id))
            raise HttpException(400,"state is not valid")
        
        hubspot_token_response: HubSpotTokenResponseDTO = await self._get_access_token(
            code
        )
        access_token_name = RedisClient.KeyNamer.get_access_token_key(org_id,user_id,HUBSPOT_CONSTS.INTEGRATION_NAME)
        refresh_token_name = RedisClient.KeyNamer.get_refresh_token_key(org_id,user_id,HUBSPOT_CONSTS.INTEGRATION_NAME)
        
        RedisClient.add_key(access_token_name, hubspot_token_response.access_token)
        RedisClient.add_key(refresh_token_name, hubspot_token_response.refresh_token)
        
        return
        
        
    async def handle_authorize(self,org_id, user_id):
      
        state_token = self._generate_State_token(org_id, user_id)
        state_token_key_name =RedisClient.KeyNamer.get_state_token_key(org_id, user_id, HUBSPOT_CONSTS.INTEGRATION_NAME)
        
        RedisClient.add_key(state_token_key_name, state_token) 
       
        params = {
            "state": state_token,
            "redirect_uri": HUBSPOT_CONSTS.TOKEN_URL,
            "scopes":HUBSPOT_CONSTS.SCOPES,
            "optional_scopes":HUBSPOT_CONSTS.OPTIONAL_SCOPES,
            "client_id":self.client_id
            
        }
        return build_url_with_params(HUBSPOT_CONSTS.USER_AUTHORIZATION_REDIRECT_URL, params)
        
        
        
            

    async def _get_access_token(self, code: str) -> HubSpotTokenResponseDTO:
        data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": HUBSPOT_CONSTS.TOKEN_URL,
            "code": code,
        }
        hubspot_token_response = await fetch(
            HTTP_METHODS.POST,
            HUBSPOT_CONSTS.TOKEN_URL,
            params=None,
            headers={"content-type": "application/x-www-form-urlencoded"},
            body=data,
        )
        return HubSpotTokenResponseDTO.model_validate(hubspot_token_response)

    async def _generate_State_token(self, org_id, user_id) -> str:
        state_data = {
            "org_id": org_id,
            "user_id": user_id,
            "rand_number": secrets.token_bytes(16).hex(),
        }
        json_string = json.dumps(state_data)
        print(json_string)
        base64_bytes = base64.urlsafe_b64encode(json_string.encode("utf-8"))
        state_token = base64_bytes.decode("utf-8")
        return state_token
    
    @staticmethod
    async def decode_state_token(state_token: str) -> dict:
        base64_bytes = state_token.encode("utf-8")
        json_bytes = base64.urlsafe_b64decode(base64_bytes)
        json_string = json_bytes.decode("utf-8")
        state_data = json.loads(json_string)
        return state_data
