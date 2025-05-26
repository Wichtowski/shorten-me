from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel, HttpUrl
import uuid
from datetime import datetime
from container import container
import secrets
import string
from responses import APIResponse

router = APIRouter(prefix="/shorten", tags=["url"])

class URLCreate(BaseModel):
    original_url: HttpUrl
    user_id: str = "anonymous"
    custom_slug: str = None

@router.post("/", status_code=201)
def create_url(url: URLCreate):
    urls_container = container.urls_container
    anon_container = container.anonymous_container
    custom_slug = url.custom_slug
    if not custom_slug:
        # Generate a short, random slug (5 chars)
        custom_slug = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(5))

    # Check for slug collision
    if url.user_id == "anonymous":
        anon_results = list(anon_container.query_items(
            query="SELECT * FROM c WHERE c.short_url = @short_url",
            parameters=[{"name": "@short_url", "value": custom_slug}],
            enable_cross_partition_query=True
        ))
        if anon_results:
            raise HTTPException(status_code=400, detail="custom_slug already exists")
    else:
        urls_results = list(urls_container.query_items(
            query="SELECT * FROM c WHERE c.short_url = @short_url",
            parameters=[{"name": "@short_url", "value": custom_slug}],
            enable_cross_partition_query=True
        ))
        if urls_results:
            raise HTTPException(status_code=400, detail="custom_slug already exists")

    url_id = str(uuid.uuid4())
    slug = custom_slug
    url_doc = {
        "id": url_id,
        "user_id": url.user_id,
        "original_url": str(url.original_url),
        "short_url": slug,
        "created_at": datetime.utcnow().isoformat(),
        "clicks": 0
    }
    if url.user_id == "anonymous":
        anon_container.upsert_item(url_doc)
    else:
        urls_container.upsert_item(url_doc)
    return APIResponse.success_response(
        message="URL shortened successfully",
        data=url_doc
    )

@router.get("/{slug}")
def get_url_by_slug(slug: str):
    urls_container = container.urls_container
    anon_container = container.anonymous_container
    # Search in anonymous_usage
    anon_results = list(anon_container.query_items(
        query="SELECT * FROM c WHERE c.short_url = @short_url",
        parameters=[{"name": "@short_url", "value": slug}],
        enable_cross_partition_query=True
    ))
    if anon_results:
        return APIResponse.success_response(
            message="URL found (anonymous)",
            data=anon_results[0]
        )
    # Search in urls
    urls_results = list(urls_container.query_items(
        query="SELECT * FROM c WHERE c.short_url = @short_url",
        parameters=[{"name": "@short_url", "value": slug}],
        enable_cross_partition_query=True
    ))
    if urls_results:
        return APIResponse.success_response(
            message="URL found",
            data=urls_results[0]
        )
    raise HTTPException(status_code=404, detail="slug not found") 