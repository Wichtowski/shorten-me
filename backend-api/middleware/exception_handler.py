from fastapi import Request, status
from fastapi.responses import JSONResponse
from exceptions import APIException
from responses import APIResponse

async def api_exception_handler(request: Request, exc: APIException):
    return JSONResponse(
        status_code=exc.status_code,
        content=APIResponse.response(message=exc.message)
    )

async def validation_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=APIResponse.response(message=str(exc))
    )

async def http_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIResponse.response(message="Internal server error")
    ) 