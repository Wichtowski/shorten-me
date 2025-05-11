from .auth import (
    CredentialsException,
    UserExistsException,
    InvalidCredentialsException
)
from .urls import (
    SlugExistsException,
    URLNotFoundException,
    InvalidURLException
)
from fastapi import status

__all__ = [
    'CredentialsException',
    'UserExistsException',
    'InvalidCredentialsException',
    'SlugExistsException',
    'URLNotFoundException',
    'InvalidURLException'
]

class APIException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class AuthenticationException(APIException):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED)

class AuthorizationException(APIException):
    def __init__(self, message: str = "Not authorized to perform this action"):
        super().__init__(message, status_code=status.HTTP_403_FORBIDDEN)

class ResourceNotFoundException(APIException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)

class ValidationException(APIException):
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class ConflictException(APIException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status_code=status.HTTP_409_CONFLICT) 