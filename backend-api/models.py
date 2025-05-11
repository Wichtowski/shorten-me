from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class URLBase(BaseModel):
    original_url: HttpUrl
    custom_slug: Optional[str] = None

class URLCreate(URLBase):
    pass

class URL(URLBase):
    id: str
    short_url: str
    user_id: str
    created_at: datetime
    clicks: int = 0

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None 