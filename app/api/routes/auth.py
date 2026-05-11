from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.schemas.user import UserLoginSchema, UserRegisterSchema, UserResponseSchema, TokenSchema
from app.services.user import UserService
from app.models.user import User
from app.api.deps import get_current_user


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponseSchema, status_code=201)
async def register (
    data: UserRegisterSchema,           # Pydantic validates the request body
    db: AsyncSession = Depends(get_db), # DB session injected
):
  
    # Check if email already taken
    if await UserService.get_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Check if username already taken
    if await UserService.get_by_username(db, data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    user = await UserService.create_user(db, data)
    return user


@router.post("/login", response_model=TokenSchema)
async def login(
    data: UserLoginSchema,              # ← JSON body instead of form
    db: AsyncSession = Depends(get_db),
):
    user = await UserService.authenticate(db, data.email, data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    return TokenSchema(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=TokenSchema)
async def refresh_token(
    data: RefreshRequest,      
    db: AsyncSession = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
    )

    try:
        from jose import JWTError
        payload = decode_token(data.refresh_token)   

        if payload.get("type") != "refresh":
            raise credentials_exception

        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = await UserService.get_by_id(db, user_id)
    if not user:
        raise credentials_exception

    return TokenSchema(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )

@router.get("/me", response_model=UserResponseSchema)
async def get_me(
    current_user: User = Depends(get_current_user),
):

    return current_user