import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator


# Request schemas 

class PostCreateSchema(BaseModel):
    """What the client sends when creating a post."""
    title: str
    content: str

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title cannot be empty")
        if len(v) > 300:
            raise ValueError("Title must be under 300 characters")
        return v

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Content cannot be empty")
        return v


class PostUpdateSchema(BaseModel):
    """
    What the client sends when updating a post.
    Both fields are Optional — a partial update.
    Client can update just the title, just the content, or both.
    None means "don't change this field".
    """
    title: str | None = None
    content: str | None = None


# Nested schemas

class PostAuthorSchema(BaseModel):
    """
    A minimal user representation embedded inside a post response.
    """
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str


# Response schemas 

class PostResponseSchema(BaseModel):
    """
    Full post representation returned by the API.
    Includes the nested author object — so the client gets
    everything it needs to render a post in one request.
    """
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    content: str
    likes_count: int
    views_count: int  
    author_id: uuid.UUID
    author: PostAuthorSchema     
    created_at: datetime
    updated_at: datetime


class PostListResponseSchema(BaseModel):
    """
    Paginated list of posts.
    Cursor-based pagination — more on this below.
    """
    items: list[PostResponseSchema]
    total: int
    has_more: bool
    next_cursor: str | None      


# Comment schemas 

class CommentCreateSchema(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Comment cannot be empty")
        return v


class CommentResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    content: str
    author_id: uuid.UUID
    post_id: uuid.UUID
    author: PostAuthorSchema
    created_at: datetime