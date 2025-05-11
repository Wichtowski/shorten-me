from fastapi import APIRouter, Depends, Request
from typing import List, Optional
from ..models import URL, URLCreate, User, URLResponse
from ..auth import get_current_user
from ..database import create_url, get_url_by_slug, increment_clicks, check_anonymous_limit, get_user_urls
from ..exceptions import (
    ConflictException,
    ResourceNotFoundException,
    AuthorizationException,
    ValidationException
)
from ..responses import APIResponse
import os
from ..container import container

router = APIRouter(
    prefix="/urls",
    tags=["urls"],
    responses={404: {"description": "Not found"}},
)

@router.post("/")
async def create_short_url(
    url: URLCreate,
    request: Request,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Create a new shortened URL."""
    base_url = os.getenv("BASE_URL", "http://localhost:8000")
    
    # Check if custom slug is already in use
    if url.custom_slug:
        existing_url = get_url_by_slug(url.custom_slug)
        if existing_url:
            raise ConflictException("Custom slug already exists")
    
    # Handle anonymous user
    if not current_user:
        # Get client IP
        client_ip = request.client.host
        # Check anonymous usage limit
        if not await check_anonymous_limit(client_ip):
            raise AuthorizationException("Anonymous usage limit reached. Please register to continue.")
        # Use IP as user_id for anonymous users
        user_id = f"anon_{client_ip}"
    else:
        user_id = current_user.id
    
    # Create the URL
    url_data = create_url(
        original_url=str(url.original_url),
        user_id=user_id,
        custom_slug=url.custom_slug
    )
    
    return APIResponse.success_response(
        data={
            "id": url_data["id"],
            "original_url": url_data["original_url"],
            "short_url": f"{base_url}/{url_data['short_url']}",
            "created_at": url_data["created_at"],
            "clicks": url_data["clicks"]
        },
        message="URL shortened successfully"
    )

@router.get("/{slug}")
async def redirect_to_url(slug: str):
    """Redirect to the original URL."""
    url_data = get_url_by_slug(slug)
    if not url_data:
        raise ResourceNotFoundException("URL not found")
    
    # Increment click count
    increment_clicks(url_data["id"], url_data["user_id"])
    
    return APIResponse.success_response(
        data={"url": url_data["original_url"]},
        message="URL found"
    )

@router.get("/")
async def get_user_urls(current_user: User = Depends(get_current_user)):
    """Get all URLs created by the current user."""
    urls = get_user_urls(current_user.id)
    return APIResponse.success_response(
        data=[
            {
                "id": url["id"],
                "original_url": url["original_url"],
                "short_url": f"{os.getenv('BASE_URL', 'http://localhost:8000')}/{url['short_url']}",
                "created_at": url["created_at"],
                "clicks": url["clicks"]
            }
            for url in urls
        ],
        message="User URLs retrieved successfully"
    )

@router.post("/{slug}/increment-clicks")
async def increment_url_clicks(slug: str):
    """Increment the click count for a URL."""
    url = get_url_by_slug(slug)
    if not url:
        raise ResourceNotFoundException("URL not found")
    
    increment_clicks(url["id"], url["user_id"])
    
    return APIResponse.success_response(
        data={
            "url_id": url["id"],
            "current_clicks": url["clicks"] + 1
        },
        message="Click count incremented successfully"
    ) 