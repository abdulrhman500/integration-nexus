from typing import List
from fastapi import APIRouter, Depends, Form, BackgroundTasks, HTTPException, status
from dtos.hubspot_dtos import OAuthCallbackRequestDTO, HubSpotAuthorizeRequestDTO
from dtos.integration_item import IntegrationItem
from fastapi.responses import RedirectResponse, JSONResponse
from config.logger_config import logger
from services.integrations.hubspot_service import hubspot_service 

router = APIRouter(prefix="/hubspot", tags=["HubSpot"])

@router.get("/oauth2/callback")
async def oauth2callback_hubspot(
    background_tasks: BackgroundTasks, 
    params: OAuthCallbackRequestDTO = Depends()
):
    background_tasks.add_task(
        hubspot_service.handle_oauth2callback, 
        code=str(params.code), 
        state=params.state
    )
    
    frontend_redirect_url = "http://localhost:3000/integrations?status=hubspot_pending"
    return RedirectResponse(url=frontend_redirect_url)


@router.post("/oauth2/authorize")
async def authorize_hubspot(org_id: str = Form(...), user_id: str = Form(...)):
    authorize_body = HubSpotAuthorizeRequestDTO(org_id=org_id, user_id=user_id)
    
    hubspot_auth_url = await hubspot_service.handle_authorize(
        authorize_body.org_id, authorize_body.user_id
    )
    
    return RedirectResponse(url=hubspot_auth_url) 
    

@router.get("/credentials")
async def get_credentials(user_id: str, org_id: str):
    credentials = await hubspot_service.get_credentials(org_id, user_id)
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HubSpot credentials not found. Please authenticate."
        )
    return {"access_token": credentials}


@router.get("/items")
async def get_items_hubspot(user_id: str, org_id: str):
    contacts:List[IntegrationItem] = await hubspot_service.get_items(org_id, user_id)
    return JSONResponse(content=contacts)
