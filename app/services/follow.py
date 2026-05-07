import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.models.follow import Follow
from app.models.user import User


class FollowService:

    @staticmethod
    async def follow_user(
        db: AsyncSession,
        follower_id: uuid.UUID,
        followed_id: uuid.UUID,
    ) -> Follow | None:
        """
        Creates a follow relationship.
        Returns None if already following 
        """
        # Can't follow yourself
        if follower_id == followed_id:
            return None

        # Check if already following
        existing = await db.execute(
            select(Follow).where(
                Follow.follower_id == follower_id,
                Follow.followed_id == followed_id,
            )
        )
        if existing.scalars().first():
            return None

        follow = Follow(follower_id=follower_id, followed_id=followed_id)
        db.add(follow)
        await db.flush()
        return follow

    @staticmethod
    async def unfollow_user(
        db: AsyncSession,
        follower_id: uuid.UUID,
        followed_id: uuid.UUID,
    ) -> bool:
        """
        Removes a follow relationship.
        Returns True if unfollowed, False if wasn't following.
        """
        result = await db.execute(
            delete(Follow).where(
                Follow.follower_id == follower_id,
                Follow.followed_id == followed_id,
            )
        )
        return result.rowcount > 0

    @staticmethod
    async def get_followers(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> list[User]:
        """
        Returns all users who follow user_id.
        Joins Follow → User to get the actual User objects,
        not just the raw follower_id UUIDs.
        """
        result = await db.execute(
            select(User)
            .join(Follow, Follow.follower_id == User.id)
            .where(Follow.followed_id == user_id)
        )
        return result.scalars().all()

    @staticmethod
    async def get_following(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> list[User]:
        """Returns all users that user_id follows."""
        result = await db.execute(
            select(User)
            .join(Follow, Follow.followed_id == User.id)
            .where(Follow.follower_id == user_id)
        )
        return result.scalars().all()
    
    @staticmethod
    async def search_users(db: AsyncSession, q: str) -> list[User]:
        result = await db.execute(
        select(User)
        .where(User.username.ilike(f"%{q}%"))
        .limit(10)
    )
        return result.scalars().all()