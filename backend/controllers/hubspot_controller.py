from fastapi import APIRouter, Depends
router = APIRouter()
from dtos.hubspot_dtos import AuthorizeDTO
from config.logger_config import logger
from utils.http_client import fetch
from config.constants import HTTP_METHODS

@router.get("/oauth2/callback")
async def callback_hubspot(params: AuthorizeDTO=Depends()):
    fetch(HTTP_METHODS.GET, "")





@router.get("/test")
async def test():
    logger.info("dddd")
    return {"mess": "hello"}


