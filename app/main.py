from contextlib import asynccontextmanager
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, posts, users
from app.api.websockets.router import router as ws_router
from app.core.config import settings


def run_migrations():
    """
    Run alembic migrations on startup.
    """
    try:
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            timeout=60,
        )
        print("=== Alembic migration output ===")
        print(result.stdout)
        if result.returncode != 0:
            print("Migration stderr:", result.stderr)
            print("Migration failed but continuing startup...")
        else:
            print("Migrations complete.")
    except Exception as e:
        print(f"Migration error: {e} — continuing startup anyway")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run migrations before accepting any requests
    run_migrations()
    yield


app = FastAPI(
    title="PulsePost",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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