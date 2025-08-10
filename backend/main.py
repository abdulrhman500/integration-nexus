from dotenv import load_dotenv
load_dotenv()
import os
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from utils.errors.handlers import http_exception_handler, Request_validation_error, general_exception_handler
from controllers.hubspot import router as hubspot_router


app = FastAPI(docs_url="/v1/docs", redoc_url="/v1/redoc", openapi_url="/v1/openapi.json")


app.add_exception_handler(Exception, general_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError,Request_validation_error)

origins = []
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         
    allow_credentials=True,         
    allow_methods=["*"],            
    allow_headers=["*"],            
)  


api_router = APIRouter()
api_router.include_router(hubspot_router, prefix="/hubspot", tags=["HubSpot"])
app.include_router(api_router, prefix="/v1")

