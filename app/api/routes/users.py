import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.websockets.manager import manager
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponseSchema
from app.services.follow import FollowService
from app.services.user import UserService

router = APIRouter(prefix="/api/users", tags=["Users"])



@router.get("/search", response_model=list[UserResponseSchema])
async def search_users(
    q: str = Query(min_length=1),
    db: AsyncSession = Depends(get_db),
):
    users = await FollowService.search_users(db, q)
    return users


@router.get("/{user_id}", response_model=UserResponseSchema)
async def get_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a user's public profile."""
    user = await UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/{user_id}/follow", status_code=204)
async def follow_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Follow another user.
    204 No Content 
    """
    target = await UserService.get_by_id(db, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot follow yourself",
        )

    result = await FollowService.follow_user(db, current_user.id, user_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already following this user",
        )
    
    await manager.send_to(str(user_id), {
        "type": "new_follower",
        "follower": current_user.username,
        "follower_id": str(current_user.id),
     })

@router.delete("/{user_id}/follow", status_code=204)
async def unfollow_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Unfollow a user."""
    unfollowed = await FollowService.unfollow_user(db, current_user.id, user_id)
    if not unfollowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not following this user",
        )


@router.get("/{user_id}/followers", response_model=list[UserResponseSchema])
async def get_followers(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """List all followers of a user."""
    user = await UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return await FollowService.get_followers(db, user_id)


@router.get("/{user_id}/following", response_model=list[UserResponseSchema])
async def get_following(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """List all users this user follows."""
    user = await UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return await FollowService.get_following(db, user_id)


