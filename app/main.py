from fastapi import FastAPI
from app.api.routes import auth
from app.api.routes import posts    
from app.api.routes import users

app = FastAPI(
    title="PulsePost",
    version="0.1.0",
)


app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(users.router)


@app.get("/health")
async def health():
    return {"status": "ok"}