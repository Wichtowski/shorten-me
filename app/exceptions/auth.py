from fastapi import HTTPException, status

class CredentialsException(HTTPException):
    """Raised when JWT token validation fails."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

class UserExistsException(HTTPException):
    """Raised when attempting to register a user that already exists."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

class InvalidCredentialsException(HTTPException):
    """Raised when login credentials are invalid."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        ) 