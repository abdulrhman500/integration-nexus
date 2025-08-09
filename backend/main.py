from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from utils.errors.handlers import http_exception_handler, Request_validation_error
from controllers.hubspot_controller import router as hubspot_router



app = FastAPI()

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError,Request_validation_error)


app.include_router(hubspot_router, prefix="/hubspot")

