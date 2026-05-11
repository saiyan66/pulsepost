import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict


class UserRegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 50:
            raise ValueError("Username must be under 50 characters")
        if not v.isalnum():
            raise ValueError("Username must be alphanumeric")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


class UserResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    email: str
    bio: str | None
    is_active: bool
    created_at: datetime


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayloadSchema(BaseModel):
    sub: str
    type: str

class PasswordResetSchema(BaseModel):
    email: EmailStr
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v