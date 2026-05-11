from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.follow import Follow
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.schemas.user import UserRegisterSchema


class UserService:

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> User | None:
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalars().first()

    @staticmethod
    async def get_by_username(db: AsyncSession, username: str) -> User | None:
        result = await db.execute(
            select(User).where(User.username == username)
        )
        return result.scalars().first()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id) -> User | None:
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalars().first()

    @staticmethod
    async def create_user(db: AsyncSession, data: UserRegisterSchema) -> User:
        user = User(
            username=data.username,
            email=data.email,
            hashed_password=hash_password(data.password),
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate(
        db: AsyncSession,
        email: str,
        password: str
    ) -> User | None:
        user = await UserService.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    async def delete_user(db: AsyncSession, user: User) -> None:
        # Break follow edges first. Without this, SQLAlchemy may attempt to null
        # composite primary-key FKs on Follow rows and crash.
        await db.execute(
            delete(Follow).where(
                (Follow.follower_id == user.id) | (Follow.followed_id == user.id)
            )
        )
        await db.delete(user)
        await db.flush()

    @staticmethod
    async def reset_password(
        db: AsyncSession,
        email: str,
        new_password: str,
    ) -> bool:
        """
        Resets a user's password directly.
        Returns True if successful, False if user not found.
        In production you'd verify identity via email token first.
        """
        user = await UserService.get_by_email(db, email)
        if not user:
            return False

        user.hashed_password = hash_password(new_password)
        await db.flush()
        return True