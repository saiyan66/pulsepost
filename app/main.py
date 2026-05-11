from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, posts, users
from app.api.websockets.router import router as ws_router
from app.core.config import settings

from contextlib import asynccontextmanager
from alembic.config import Config
from alembic import command
import asyncio


def run_migrations():
    """Run Alembic migrations synchronously."""
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on startup
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, run_migrations)
    yield
    # Runs on shutdown 

app = FastAPI(
    title="PulsePost",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,  #docs disabled in prod
    redoc_url="/redoc" if settings.DEBUG else None,
)

origins = [
    "http://localhost:5173",       # Vite dev server
    "http://localhost:3000",       # Alternative local
]


if settings.ENVIRONMENT == "production":
    origins = ["*"] 


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(users.router)
app.include_router(ws_router)


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}