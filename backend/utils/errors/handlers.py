from fastapi import Request, HTTPException, status
from fastapi import status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from config.logger import logger

async def http_exception_handler(req: Request, exc: HTTPException):
    
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
    
    
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"An unhandled exception occurred for request: {request.method} {request.url}",
        exc_info=exc 
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected internal server error occurred"},
    )    
    
    
