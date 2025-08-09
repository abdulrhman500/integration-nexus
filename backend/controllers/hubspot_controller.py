from fastapi import APIRouter, Depends, Form, Response
router = APIRouter()
from dtos.hubspot_dtos import OAuthCallbackRequestDTO, HubSpotAuthorizeRequestDTO
from fastapi.responses import RedirectResponse
from config.logger_config import logger
from utils.http_client import fetch
from config.constants import HTTP_METHODS
from services.integrations.hubspot_service import handle_oauth2callback 

@router.get("/oauth2/callback")
async def oauth2callback_hubspot(params: OAuthCallbackRequestDTO=Depends()):
    # fetch(HTTP_METHODS.GET, "")
    handle_oauth2callback()
    pass


@router.post("/oauth2/authorize")
async def authorize_hubspot(org_id: str = Form(...), user_id: str = Form(...)):
    
    body = HubSpotAuthorizeRequestDTO.model_validate({"org_id": org_id, "user_id": user_id})
    
    huspost_auth_url= handle_authorize(org_id, user_id)
    
    return RedirectResponse(huspost_auth_url) 
    
    
            

@router.get("/test")
async def test():
    logger.info("dddd")
    return {"mess": "hello"}


async def get_hubspot_credentials(user_id, org_id):
    # TODO
    pass


async def create_integration_item_metadata_object(response_json):
    # TODO
    pass


async def get_items_hubspot(credentials):
    # TODO
    pass


