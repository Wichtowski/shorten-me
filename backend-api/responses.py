from typing import Any, Optional, Dict, TypeVar, Generic
from pydantic import BaseModel, Field

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    success: bool = Field(default=True)
    message: str = Field(default="Success")
    data: Optional[T] = None
    error: Optional[str] = None

    @classmethod
    def success_response(cls, data: Any = None, message: str = "Success") -> Dict:
        if data is None:
            return cls(
                success=True,
                message=message
            ).dict(exclude_none=True)
        
        return cls(
            success=True,
            message=message,
            data=data
        ).dict(exclude_none=True)

    @classmethod
    def error_response(cls, error: str) -> Dict:
        return cls(
            success=False,
            message="Error",
            error=error
        ).dict(exclude_none=True) 