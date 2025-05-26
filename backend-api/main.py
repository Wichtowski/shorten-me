import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from middleware.exception_handler import (
    api_exception_handler,
    http_exception_handler
)
from exceptions import APIException
from routers import user, url, health

# Load environment variables
load_dotenv()

app = FastAPI(title="URL Shortener API", root_path="/v1/api")

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

app.include_router(user.router)
app.include_router(url.router)
app.include_router(health.router)



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 