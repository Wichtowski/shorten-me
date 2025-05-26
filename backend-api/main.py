import uvicorn
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from dotenv import load_dotenv
from responses import APIResponse
from middleware.exception_handler import (
    api_exception_handler,
    validation_exception_handler,
    http_exception_handler
)
from exceptions import APIException
from routers import user, url, health
from container import Container

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

@app.get("/health")
async def health_check():
    container = Container()
    health_status = container.health_check()
    if health_status["status"] == "healthy":
        return JSONResponse(
            content=APIResponse.success_response(
                message="Health check successful",
                data=health_status
            ),
            status_code=status.HTTP_200_OK
        )
    else:
        return JSONResponse(
            content=APIResponse.error_response(
                message="Health check failed",
                error=health_status
            ),
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 