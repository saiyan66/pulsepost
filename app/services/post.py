import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.models.post import Post
from app.models.comment import Comment
from app.models.follow import Follow
from app.models.user import User
from app.schemas.post import PostCreateSchema, PostUpdateSchema, CommentCreateSchema


class PostService:

    @staticmethod
    async def create_post(
        db: AsyncSession,
        data: PostCreateSchema,
        author_id: uuid.UUID,
    ) -> Post:
        """
        Creates a post and links it to the author.
        selectinload is set up on the query after flush so the
        author relationship is populated before return.
        """
        post = Post(
            title=data.title,
            content=data.content,
            author_id=author_id,
        )
        db.add(post)
        await db.flush()

        # Reload with author relationship populated.
        result = await db.execute(
            select(Post)
            .options(selectinload(Post.author))
            .where(Post.id == post.id)
        )
        return result.scalars().first()

    @staticmethod
    async def get_post_by_id(
        db: AsyncSession,
        post_id: uuid.UUID,
    ) -> Post | None:
        """
        Fetches a single post with its author loaded.
        selectinload(Post.author) tells SQLAlchemy to load the author
        relationship in the same query — one SQL call, not two.
        """
        result = await db.execute(
            select(Post)
            .options(selectinload(Post.author))
            .where(Post.id == post_id)
        )
        return result.scalars().first()

    @staticmethod
    async def get_posts(
        db: AsyncSession,
        limit: int = 10,
        cursor: uuid.UUID | None = None,
    ) -> dict:
        """
        Fetches a paginated list of posts, newest first.
        cursor: if provided, fetch posts older than this post's created_at.
        """
        query = (
            select(Post)
            .options(selectinload(Post.author))
            .order_by(desc(Post.created_at))
        )

        # If cursor provided, find that post's created_at
        # then return only posts older than it
        if cursor:
            cursor_post = await PostService.get_post_by_id(db, cursor)
            if cursor_post:
                query = query.where(Post.created_at < cursor_post.created_at)

        # Fetch one extra to know if there are more pages
        # If we asked for 10 and got 11, there are more.
        query = query.limit(limit + 1)

        result = await db.execute(query)
        posts = result.scalars().all()

        has_more = len(posts) > limit
        if has_more:
            posts = posts[:limit]   # trim the extra one

        # Count total posts for the response
        count_result = await db.execute(select(func.count(Post.id)))
        total = count_result.scalar()

        return {
            "items": posts,
            "total": total,
            "has_more": has_more,
            # The cursor for the next page is the ID of the last item
            "next_cursor": str(posts[-1].id) if has_more else None,
        }

    @staticmethod
    async def get_feed(
        db: AsyncSession,
        user_id: uuid.UUID,
        limit: int = 10,
        cursor: uuid.UUID | None = None,
    ) -> dict:
        """
        Returns posts from users that user_id follows.
        """
        # Subquery: IDs of users that current user follows
        followed_ids = (
            select(Follow.followed_id)
            .where(Follow.follower_id == user_id)
            .scalar_subquery()
        )

        query = (
            select(Post)
            .options(selectinload(Post.author))
            .where(Post.author_id.in_(followed_ids))
            .order_by(desc(Post.created_at))
        )

        if cursor:
            cursor_post = await PostService.get_post_by_id(db, cursor)
            if cursor_post:
                query = query.where(Post.created_at < cursor_post.created_at)

        query = query.limit(limit + 1)
        result = await db.execute(query)
        posts = result.scalars().all()

        has_more = len(posts) > limit
        if has_more:
            posts = posts[:limit]

        return {
            "items": posts,
            "total": len(posts),
            "has_more": has_more,
            "next_cursor": str(posts[-1].id) if has_more else None,
        }

    @staticmethod
    async def update_post(
        db: AsyncSession,
        post: Post,
        data: PostUpdateSchema,
    ) -> Post:
        """
        only update fields that are not None.
        never overwrite a field the client didn't intend to change.
        """
        if data.title is not None:
            post.title = data.title
        if data.content is not None:
            post.content = data.content

        await db.flush()
        await db.refresh(post)
        return post

    @staticmethod
    async def delete_post(db: AsyncSession, post: Post) -> None:
        await db.delete(post)
        await db.flush()

    # ── Comment methods ──────────────────────────────────────────────

    @staticmethod
    async def create_comment(
        db: AsyncSession,
        post_id: uuid.UUID,
        author_id: uuid.UUID,
        data: CommentCreateSchema,
    ) -> Comment:
        comment = Comment(
            content=data.content,
            post_id=post_id,
            author_id=author_id,
        )
        db.add(comment)
        await db.flush()

        result = await db.execute(
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.id == comment.id)
        )
        return result.scalars().first()

    @staticmethod
    async def get_comments(
        db: AsyncSession,
        post_id: uuid.UUID,
    ) -> list[Comment]:
        result = await db.execute(
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.post_id == post_id)
            .order_by(Comment.created_at)
        )
        return result.scalars().all()

    @staticmethod
    async def get_comment_by_id(
        db: AsyncSession,
        comment_id: uuid.UUID,
    ) -> Comment | None:
        result = await db.execute(
            select(Comment).where(Comment.id == comment_id)
        )
        return result.scalars().first()

    @staticmethod
    async def delete_comment(db: AsyncSession, comment: Comment) -> None:
        await db.delete(comment)
        await db.flush()