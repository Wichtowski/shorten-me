from fastapi import FastAPI, Depends, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional
import os
from dotenv import load_dotenv
from .responses import APIResponse
from .middleware.exception_handler import (
    api_exception_handler,
    validation_exception_handler,
    http_exception_handler
)
from .exceptions import APIException

# Load environment variables
load_dotenv()

app = FastAPI(title="URL Shortener API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(Exception, http_exception_handler)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/")
async def root():
    return APIResponse.success_response(
        message="Welcome to URL Shortener API"
    )

@app.get("/health")
async def health_check():
    return APIResponse.success_response(
        data={
            "status": "healthy",
            "timestamp": datetime.utcnow()
        }
    ) 