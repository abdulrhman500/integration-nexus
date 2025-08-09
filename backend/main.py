from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from utils.errors.handlers import http_exception_handler, Request_validation_error, general_exception_handler
from controllers.hubspot_controller import router as hubspot_router


app = FastAPI()



app.add_exception_handler(Exception, general_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError,Request_validation_error)

origins = [
    "http://localhost:3000",  
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         
    allow_credentials=True,         
    allow_methods=["*"],            
    allow_headers=["*"],            
)   
app.include_router(hubspot_router, prefix="/hubspot")

