from azure.cosmos import CosmosClient, PartitionKey
import os
from datetime import datetime
import uuid
from typing import Optional, List, Dict
from fastapi import Request
from .container import container

# Cosmos DB configuration
COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
DATABASE_NAME = "urlshortener"
CONTAINER_USERS = "users"
CONTAINER_URLS = "urls"
CONTAINER_ANONYMOUS = "anonymous_usage"

# Initialize Cosmos DB client
client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
database = client.create_database_if_not_exists(id=DATABASE_NAME)

# Create containers
users_container = database.create_container_if_not_exists(
    id=CONTAINER_USERS,
    partition_key=PartitionKey(path="/username")
)

urls_container = database.create_container_if_not_exists(
    id=CONTAINER_URLS,
    partition_key=PartitionKey(path="/user_id")
)

anonymous_container = database.create_container_if_not_exists(
    id=CONTAINER_ANONYMOUS,
    partition_key=PartitionKey(path="/ip_address")
)

async def check_anonymous_limit(ip_address: str) -> bool:
    """Check if an IP address has reached the anonymous usage limit."""
    query = f"SELECT * FROM c WHERE c.ip_address = '{ip_address}'"
    items = list(container.anonymous_container.query_items(query=query, enable_cross_partition_query=True))
    
    if not items:
        # First time user
        container.anonymous_container.create_item(body={
            "ip_address": ip_address,
            "count": 1,
            "created_at": datetime.utcnow().isoformat()
        })
        return True
    
    usage = items[0]
    if usage["count"] >= 3:
        return False
    
    # Increment count
    usage["count"] += 1
    container.anonymous_container.replace_item(item=usage, body=usage)
    return True

def create_user(email: str, username: str, hashed_password: str) -> dict:
    """Create a new user in the users container."""
    user = {
        "id": str(uuid.uuid4()),
        "username": username,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.utcnow().isoformat(),
        "is_active": True
    }
    container.users_container.create_item(body=user)
    return user

def get_user_by_username(username: str) -> Optional[dict]:
    """Get a user by username from the users container."""
    query = f"SELECT * FROM c WHERE c.username = '{username}'"
    items = list(container.users_container.query_items(query=query, enable_cross_partition_query=True))
    return items[0] if items else None

def create_url(original_url: str, user_id: str, custom_slug: str = None) -> dict:
    """Create a new URL entry in the urls container."""
    url_id = str(uuid.uuid4())
    slug = custom_slug or url_id[:8]
    
    url = {
        "id": url_id,
        "user_id": user_id,
        "original_url": original_url,
        "short_url": slug,
        "created_at": datetime.utcnow().isoformat(),
        "clicks": 0
    }
    container.urls_container.create_item(body=url)
    return url

def get_url_by_slug(slug: str) -> Optional[dict]:
    """Get a URL by its slug from the urls container."""
    query = f"SELECT * FROM c WHERE c.short_url = '{slug}'"
    items = list(container.urls_container.query_items(query=query, enable_cross_partition_query=True))
    return items[0] if items else None

def get_user_urls(user_id: str) -> List[dict]:
    """Get all URLs created by a user."""
    query = f"SELECT * FROM c WHERE c.user_id = '{user_id}'"
    return list(container.urls_container.query_items(query=query, enable_cross_partition_query=True))

def increment_clicks(url_id: str, user_id: str):
    """Increment the click count for a URL."""
    query = f"SELECT * FROM c WHERE c.id = '{url_id}' AND c.user_id = '{user_id}'"
    items = list(container.urls_container.query_items(query=query, enable_cross_partition_query=True))
    if items:
        url = items[0]
        url["clicks"] = url.get("clicks", 0) + 1
        container.urls_container.replace_item(item=url, body=url) 