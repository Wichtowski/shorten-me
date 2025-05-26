from fastapi import APIRouter
from container import container
from responses import APIResponse

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
def health_check():
    return APIResponse.success_response(
        message="Health check successful",
        data=container.health_check()
    ) 