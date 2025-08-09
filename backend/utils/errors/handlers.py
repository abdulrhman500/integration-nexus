from fastapi import Request, HTTPException, status
from fastapi import status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logger = logging.getLogger(__name__)

async def http_exception_handler(req: Request, exc: HTTPException):
    assert isinstance(exc, HTTPException)
    # Log the error
    logger.info(f"{exc.status_code} - {exc.detail} - Path: {req.url.path}")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTPException",
            "detail": exc.detail,
            "path": req.url.path
        }
    )

async def Request_validation_error(req: Request, exc: RequestValidationError):
    logger.info(f"Validation error: {exc.errors()} - Path: {req.url.path}")
    return JSONResponse(
        status_code= status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "details": exc.errors(),
            "path": req.url.path
        }
    )
    
    
