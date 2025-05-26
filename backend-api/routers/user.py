from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime, timedelta
import jwt
from container import container
from responses import APIResponse

JWT_SECRET = container.get_config("secret_key") or "default-secret-key"
JWT_ALGORITHM = container.get_config("algorithm") or "HS256"

router = APIRouter(prefix="/user", tags=["user"])

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

@router.post("/", status_code=201)
def create_user(user: UserCreate):
    users_container = container.users_container

    # Check if password is already hashed (bcrypt hash starts with $2b$ or $2a$)
    if not (user.password.startswith("$2b$") or user.password.startswith("$2a$")):
        raise HTTPException(status_code=400, detail="Password must be pre-hashed with bcrypt.")
    user_results = list(users_container.query_items(
        query="SELECT * FROM c WHERE c.email = @email",
        parameters=[{"name": "@email", "value": user.email}],
        enable_cross_partition_query=True
    ))
    if user_results:
        raise HTTPException(status_code=400, detail="Email already exists")

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "created_at": datetime.utcnow().isoformat(),
        "is_active": True
    }
    users_container.upsert_item(user_doc)
    user_doc.pop("password")

    token_payload = {
        "user_id": user_id,
        "email": user.email,
        "username": user.username,
        "exp": (datetime.utcnow() + timedelta(weeks=1)).timestamp()
    }
    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    user_doc["token"] = token
    
    return APIResponse.success_response(
        data=user_doc,
        message="User created successfully"
    )