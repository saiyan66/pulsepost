import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_
from app.core.database import get_db
from app.core.cache import get_cached, set_cached, delete_cached, delete_pattern
from app.api.deps import get_current_user
from app.api.websockets.manager import manager
from app.models.user import User
from app.schemas.post import (
    PostCreateSchema, PostUpdateSchema, PostResponseSchema,
    PostListResponseSchema, CommentCreateSchema, CommentResponseSchema,
)
from app.services.post import PostService
from app.services.like import LikeService



router = APIRouter(prefix="/api/posts", tags=["Posts"])


# ── Post endpoints 

@router.post("", response_model=PostResponseSchema, status_code=201)
async def create_post(
    data: PostCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new post.
    current_user is injected by get_current_user
    """
    post = await PostService.create_post(db, data, current_user.id)

    # Invalidate list cache — new post means cached lists are stale
    await delete_pattern("posts:list:*")

    await manager.broadcast({
        "type": "new_post",
        "post_id": str(post.id),
        "title": post.title,
        "author": current_user.username,
        "author_id": str(current_user.id),
    })

    return post


@router.get("/feed", response_model=PostListResponseSchema)
async def get_feed(
    limit: int = Query(default=10, ge=1, le=50),
    cursor: uuid.UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    /feed must be defined BEFORE /{post_id} — otherwise FastAPI
    would try to match "feed" as a UUID and fail.
    ge=1 means >= 1, le=50 means <= 50.
    """
    feed = await PostService.get_feed(db, current_user.id, limit, cursor)
    return feed


@router.get("/search", response_model=dict)
async def search_posts(
    q: str = Query(min_length=1),
    db: AsyncSession = Depends(get_db),
):
    posts = await PostService.search_posts(db, q)
    return {
        "posts": [
            PostResponseSchema.model_validate(p).model_dump(mode="json")
            for p in posts
        ]
    }

@router.get("/top", response_model=list[PostResponseSchema])  #top picks
async def get_top_posts(
    db: AsyncSession = Depends(get_db),
):
    posts = await LikeService.get_top_posts(db, limit=5)
    return posts


@router.get("", response_model=PostListResponseSchema)
async def get_posts(
    limit: int = Query(default=10, ge=1, le=50),
    cursor: uuid.UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    Public list of all posts.
    Cache key includes limit and cursor so different pages
    are cached independently.
    """
    cache_key = f"posts:list:{limit}:{cursor}"
    cached = await get_cached(cache_key)
    if cached:
        return cached  #return cached data directly (no DB query)

    result = await PostService.get_posts(db, limit, cursor)

    # Serialize for caching (UUIDs and datetimes need str conversion)
    cacheable = {
        "items": [
            {**PostResponseSchema.model_validate(p).model_dump(mode="json")}
            for p in result["items"]
        ],
        "total": result["total"],
        "has_more": result["has_more"],
        "next_cursor": result["next_cursor"],
    }
    await set_cached(cache_key, cacheable, expire_seconds=60)

    return result


@router.get("/{post_id}", response_model=PostResponseSchema)
async def get_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
      1. Check cache → if hit, return cached value
      2. If miss → query DB, store in cache, return result
    """
    cache_key = f"posts:{post_id}"
    cached = await get_cached(cache_key)
    if cached:

        import asyncio     #Still increment views even on cache hit
        asyncio.create_task(
            _increment_views_background(post_id)
        )
        return cached

    post = await PostService.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    
    await LikeService.increment_views(db, post_id)   #increment the views
    cacheable = PostResponseSchema.model_validate(post).model_dump(mode="json")
    await set_cached(cache_key, cacheable, expire_seconds=300)

    return post


@router.put("/{post_id}", response_model=PostResponseSchema)
async def update_post(
    post_id: uuid.UUID,
    data: PostUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
     Only the author can update their own post.
    After updating, invalidates this post's cache so stale
    data isn't served.
    """
    post = await PostService.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Authorization check — is this user the author?
    # Authentication (are you logged in?) is handled by get_current_user.
    # Authorization (are you allowed to do this?).
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own posts",
        )

    updated = await PostService.update_post(db, post, data)

    # Invalidate this post's cache
    await delete_cached(f"posts:{post_id}")
    await delete_pattern("posts:list:*")

    return updated


@router.delete("/{post_id}", status_code=204)
async def delete_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a post. 204 No Content.
    """
    post = await PostService.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own posts",
        )

    await PostService.delete_post(db, post)
    await delete_cached(f"posts:{post_id}")
    await delete_pattern("posts:list:*")

@router.post("/{post_id}/like", status_code=204)
async def like_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Like a post. Idempotent — liking twice has no effect."""
    post = await PostService.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    await LikeService.like_post(db, current_user.id, post_id)
    # Invalidate post cache so updated likes_count is served
    await delete_cached(f"posts:{post_id}")


@router.delete("/{post_id}/like", status_code=204)
async def unlike_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Unlike a post."""
    await LikeService.unlike_post(db, current_user.id, post_id)
    await delete_cached(f"posts:{post_id}")

#like routes
@router.get("/{post_id}/liked", response_model=dict)
async def check_liked(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Check if the current user has liked this post."""
    liked = await LikeService.is_liked(db, current_user.id, post_id)
    return {"liked": liked}

#Comment endpoints

@router.post("/{post_id}/comments", response_model=CommentResponseSchema, status_code=201)
async def create_comment(
    post_id: uuid.UUID,
    data: CommentCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = await PostService.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = await PostService.create_comment(db, post_id, current_user.id, data)

    if str(post.author_id) != str(current_user.id):
        await manager.send_to(str(post.author_id), {
            "type": "new_comment",
            "post_id": str(post_id),
            "post_title": post.title,
            "commenter": current_user.username,
    })
    return comment


@router.get("/{post_id}/comments", response_model=list[CommentResponseSchema])
async def get_comments(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    post = await PostService.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = await PostService.get_comments(db, post_id)
    return comments


@router.delete("/{post_id}/comments/{comment_id}", status_code=204)
async def delete_comment(
    post_id: uuid.UUID,
    comment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = await PostService.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Only the comment author can delete it
    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments",
        )

    await PostService.delete_comment(db, comment)


