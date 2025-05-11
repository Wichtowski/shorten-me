from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from ..models import User, UserCreate, Token
from ..auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..database import create_user, get_user_by_username
from ..responses import APIResponse
from ..exceptions import ConflictException, AuthenticationException

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

@router.post("/register")
async def register_user(user: UserCreate):
    """Register a new user."""
    # Check if username already exists
    db_user = get_user_by_username(user.username)
    if db_user:
        raise ConflictException("Username already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_data = create_user(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    
    return APIResponse.success_response(
        data=User(
            id=user_data["RowKey"],
            email=user_data["email"],
            username=user_data["PartitionKey"],
            created_at=user_data["created_at"]
        ),
        message="User registered successfully"
    )

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login to get access token."""
    user = get_user_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise AuthenticationException("Incorrect username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["PartitionKey"]},
        expires_delta=access_token_expires
    )
    
    return APIResponse.success_response(
        data={"access_token": access_token, "token_type": "bearer"},
        message="Login successful"
    ) 