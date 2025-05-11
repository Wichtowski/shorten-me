from fastapi import HTTPException, status

class SlugExistsException(HTTPException):
    """Raised when attempting to create a URL with a custom slug that already exists."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Custom slug already in use"
        )

class URLNotFoundException(HTTPException):
    """Raised when a requested URL or slug cannot be found."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found"
        )

class InvalidURLException(HTTPException):
    """Raised when the provided URL is invalid."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL provided"
        ) 