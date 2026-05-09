import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.models.like import PostLike
from app.models.post import Post


class LikeService:

    @staticmethod
    async def like_post(
        db: AsyncSession,
        user_id: uuid.UUID,
        post_id: uuid.UUID,
    ) -> bool:
        """
        Like a post. Returns True if liked, False if already liked.
        """

        existing = await db.execute(
            select(PostLike).where(
                PostLike.user_id == user_id,
                PostLike.post_id == post_id,
            )
        )
        if existing.scalars().first():
            return False  


        like = PostLike(user_id=user_id, post_id=post_id)
        db.add(like)

     
        post = await db.get(Post, post_id)
        if post:
            post.likes_count += 1

        await db.flush()
        return True

    @staticmethod
    async def unlike_post(
        db: AsyncSession,
        user_id: uuid.UUID,
        post_id: uuid.UUID,
    ) -> bool:
        """
        Unlike a post. Returns True if unliked, False if wasn't liked.
        """
        result = await db.execute(
            select(PostLike).where(
                PostLike.user_id == user_id,
                PostLike.post_id == post_id,
            )
        )
        like = result.scalars().first()
        if not like:
            return False

        await db.delete(like)

        # Decrement never go below 0
        post = await db.get(Post, post_id)
        if post and post.likes_count > 0:
            post.likes_count -= 1

        await db.flush()
        return True

    @staticmethod
    async def is_liked(
        db: AsyncSession,
        user_id: uuid.UUID,
        post_id: uuid.UUID,
    ) -> bool:
        """Check if a user has liked a post."""
        result = await db.execute(
            select(PostLike).where(
                PostLike.user_id == user_id,
                PostLike.post_id == post_id,
            )
        )
        return result.scalars().first() is not None

    @staticmethod
    async def get_top_posts(
        db: AsyncSession,
        limit: int = 5,
    ) -> list[Post]:
        """
        Returns the most liked posts.
        Used for Top Picks in the right panel.
        """
        result = await db.execute(
            select(Post)
            .options(selectinload(Post.author))
            .where(Post.likes_count > 0)   #posts with at least one like
            .order_by(desc(Post.likes_count), desc(Post.created_at))
            .limit(limit)
        )
        return result.scalars().all()

 