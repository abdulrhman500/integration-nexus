from fastapi import APIRouter, Depends
router = APIRouter()
from dtos.hubspot_dtos import AuthorzeDTO
from config.logger_config import logger

@router.get("/authorize")
async def authorize_hubspot(params: AuthorzeDTO=Depends()):
    # TODO
    pass

@router.get("/test")
async def test():
    logger.info("dddd")
    return {"mess": "hello"}


