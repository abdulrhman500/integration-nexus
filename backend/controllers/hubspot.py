from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from dtos.hubspot import OAuthCallbackRequestDTO, UserOrgParamsDTO
from dtos.standard import IntegrationItem
from fastapi.responses import RedirectResponse
from config.logger import logger
from services.integrations.hubspot import hubspot_service
import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
router = APIRouter()


@router.get("/oauth2/callback")
async def oauth2callback(params: OAuthCallbackRequestDTO = Depends()):
    frontend_redirect_url = f"{FRONTEND_URL}?status=success"
    try:
        await hubspot_service.handle_oauth2callback(
            code=str(params.code), state=params.state
        )
    except Exception as e:
        logger.error(f"Error in oauth2callback: {e}")
        frontend_redirect_url = f"{FRONTEND_URL}?status=error"

    return RedirectResponse(url=frontend_redirect_url)


@router.get("/oauth2/authorize")
async def authorize(params: UserOrgParamsDTO = Depends()):

    hubspot_auth_url = await hubspot_service.handle_authorize(
        params.org_id, params.user_id
    )
    return RedirectResponse(url=hubspot_auth_url)


@router.get("/credentials", response_model=dict)
async def get_credentials(params: UserOrgParamsDTO = Depends()):
    credentials = await hubspot_service.get_credentials(params.org_id, params.user_id)
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HubSpot credentials not found. Please authenticate.",
        )
    return {"access_token": credentials}


@router.get("/items")
async def get_items(params: UserOrgParamsDTO = Depends()):

    contacts: List[IntegrationItem] = await hubspot_service.get_items(
        params.org_id, params.user_id
    )
    logger.info(
        f"Fetching HubSpot items for user {params.user_id} in org {params.org_id}. Contacts: {contacts}"
    )

    return contacts
