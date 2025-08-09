from utils.http_client import fetch
from config.constants import HTTP_METHODS
import os
from config.logger_config import logger
from dtos.hubspot_dtos import HubSpotTokenResponseDTO
from utils.redis.redis_client import add_key_value



async def authorize_hubspot(user_id, org_id):
    # TODO
    pass


async def get_access_token(token_url, client_id, client_secret, redirect_uri, code)->HubSpotTokenResponseDTO:
    data = {
        "grant_type": "authorization_code",
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "code": code,
    }
    hubspot_token_response = await fetch(
        HTTP_METHODS.POST,
        str(token_url),
        params=None,
        headers={"content-type": "application/x-www-form-urlencoded"},
        body=data,
    ) 
    return HubSpotTokenResponseDTO.model_validate(hubspot_token_response)
    
async def oauth2callback(code: str, state: str):
    token_url: str | None = os.getenv("HUBSPOT_TOKEN_URL")
    client_id: str | None = os.getenv("HUBSPOT_CLIENT_ID")
    client_secret: str | None = os.getenv("HUBSPOT_CLIENT_SECRET")
    redirect_uri: str | None = os.getenv("HUBSPOT_REDIRECT_URI")

    if not all([token_url, client_id, client_secret, redirect_uri]):
        logger.error(
            f"one or more missing required HubSpot OAuth environment variable(s): HUBSPOT_TOKEN_URL HUBSPOT_CLIENT_ID HUBSPOT_CLIENT_SECRET HUBSPOT_REDIRECT_URI"
        )
        raise Exception(
            "OAuth environment configuration error"
        )  # general_exception_handler will handle this
    
    hubspot_token_response:HubSpotTokenResponseDTO = await get_access_token(token_url,client_id, client_secret, redirect_uri, code)
    # add_key_value("") TODO
    
    


async def get_hubspot_credentials(user_id, org_id):
    # TODO
    pass


async def create_integration_item_metadata_object(response_json):
    # TODO
    pass


async def get_items_hubspot(credentials):
    # TODO
    pass
