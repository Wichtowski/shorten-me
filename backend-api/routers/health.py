from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from container import container
from responses import APIResponse

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
def health_check():
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
