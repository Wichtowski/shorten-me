from typing import Any, Optional, Dict, TypeVar, Generic
from pydantic import BaseModel, Field

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    message: str
    data: Optional[T] = None
    error: Optional[Any] = None

    @classmethod
    def success_response(cls, message: str, data: Any = None) -> Dict:
        return cls(message=message, data=data).dict(exclude_none=True)

    @classmethod
    def error_response(cls, message: str, error: Any = None) -> Dict:
        return cls(message=message, error=error).dict(exclude_none=True)
