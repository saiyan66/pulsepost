# PulsePost

A real-time social blogging platform where users write posts, follow authors, and receive live notifications. Built end-to-end with a production-grade async backend and a minimal editorial frontend.

**Live -** `https:pulsepost-blog.vercel.app` &nbsp;|&nbsp; **API -** `https://pulsepost-khzz.onrender.com`

---

## What it does

- Write and publish blog posts with a full read/edit/delete flow
- Follow authors — your feed shows only posts from people you follow
- Like posts — top liked posts surface in the sidebar
- Comment on posts in real time
- Receive live notifications (new follower, comment, like) via WebSocket
- Search posts and users
- Full authentication — register, login, JWT refresh, password reset, account deletion

---

## Tech Stack

### Backend
| Layer | Technology | Purpose |
|---|---|---|
| Framework | FastAPI | Async REST API + WebSocket server |
| Database | PostgreSQL + SQLAlchemy (async) | Primary data store, ORM |
| Migrations | Alembic | Schema version control |
| Cache | Redis (Upstash) | Post caching, cache invalidation |
| Auth | JWT (python-jose) + bcrypt | Stateless auth, password hashing |
| Server | Uvicorn (ASGI) | Async server, handles concurrent connections |
| Realtime | WebSockets (FastAPI native) | Live notifications pushed to clients |

### Frontend
| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 18 + Vite | Component-based UI, fast dev builds |
| State | React Context (AuthProvider) | Global auth state without Redux |
| API layer | Native fetch (centralized client) | Single request wrapper with auth headers |
| Realtime | Browser WebSocket API | Receives push notifications |
| Styling | CSS custom properties | Design tokens, no CSS framework |

### Infrastructure
| | |
|---|---|
| Backend hosting | Render (auto-deploys from GitHub) |
| Frontend hosting | Vercel (auto-deploys from GitHub) |
| Database | Render managed PostgreSQL |
| Cache | Upstash managed Redis |
| Containers (local) | Docker Compose — Postgres + Redis |

---

## Architecture

```
Client (React/Vite)
        │
        ├── HTTP requests → FastAPI REST API
        │                        │
        │                        ├── SQLAlchemy → PostgreSQL
        │                        ├── Redis cache (post lists, single posts)
        │                        └── ConnectionManager → WebSocket hub
        │
        └── WebSocket connection → /ws?token=<jwt>
                                        │
                                        └── Push: new_post, new_follower,
                                                   new_comment, new_like
```

**Request flow for a protected endpoint:**

```
Request arrives → FastAPI matches route
    → Depends(get_current_user)
        → HTTPBearer extracts token
        → decode_token() verifies JWT signature + expiry
        → UserService.get_by_id() loads user from DB
    → Depends(get_db)
        → AsyncSession opened from connection pool
    → Handler runs with user + session injected
    → get_db commits or rolls back after handler returns
    → Response serialized through Pydantic schema
```

---

## Project Structure

```
pulsepost/
├── app/
│   ├── main.py                    # FastAPI app, CORS, lifespan
│   ├── core/
│   │   ├── config.py              # pydantic-settings, reads .env
│   │   ├── database.py            # async engine, get_db dependency
│   │   ├── security.py            # JWT, bcrypt
│   │   └── cache.py               # Redis get/set/delete/invalidate
│   ├── models/                    # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── post.py
│   │   ├── follow.py
│   │   ├── comment.py
│   │   └── like.py
│   ├── schemas/                   # Pydantic request/response schemas
│   ├── services/                  # Business logic layer
│   │   ├── user.py
│   │   ├── post.py
│   │   ├── follow.py
│   │   └── like.py
│   └── api/
│       ├── deps.py                # get_current_user dependency
│       ├── routes/
│       │   ├── auth.py            # register, login, refresh, reset
│       │   ├── posts.py           # CRUD, feed, search, likes, comments
│       │   └── users.py           # profile, follow, search, delete
│       └── websockets/
│           ├── manager.py         # ConnectionManager (user_id → WebSocket)
│           └── router.py          # /ws endpoint, JWT auth handshake
├── alembic/                       # Migration history
├── ui/                            # React frontend
│   └── src/
│       ├── api/client.js          # Centralized fetch wrapper
│       ├── store/Auth.jsx         # AuthContext + useAuth hook
│       ├── hooks/useWebSocket.js  # WS connect, ping, reconnect
│       ├── components/
│       │   ├── Layout/            # Header, Sidebar, RightPanel
│       │   ├── Post/              # PostCard, PostDetail (read + edit)
│       │   └── UI/                # AuthModal, Toast, UserProfileModal
│       └── pages/                 # Feed, Explore, Search, Write, Profile
├── docker-compose.yml             # Local Postgres + Redis
└── requirements.txt
```

---

## Key Design Decisions

**Layered architecture** — routes only handle HTTP concerns, services own all business logic and DB queries, schemas define the API contract. Each layer is independently testable and changeable.

**Async throughout** — FastAPI + SQLAlchemy async + asyncpg means the server never blocks on I/O. While one request waits for a DB response, the event loop handles other requests on the same thread.

**Stateless auth** — JWTs are never stored server-side. The server verifies the signature on every request using `SECRET_KEY`. Access tokens expire in 30 minutes, refresh tokens in 7 days.

**Cache-aside pattern** — on reads, check Redis first. On miss, query Postgres, store in Redis with TTL. On writes, invalidate related cache keys. Post lists cache for 60 seconds, individual posts for 5 minutes.

**Cursor-based pagination** — avoids the offset pagination problem where new inserts shift pages. The cursor is the ID of the last item received; the next query fetches items older than that timestamp.

**WebSocket connection manager** — a singleton `dict[user_id → WebSocket]` shared across the app. When an event fires (post created, follow, like, comment), the relevant route calls `manager.send_to()` or `manager.broadcast()`. No external message broker needed at this scale.

**Dependency injection** — `get_db` and `get_current_user` are FastAPI dependencies that chain together. `get_current_user` itself depends on `get_db`, and FastAPI's DI system caches dependencies within a request so the session is never opened twice.

---

## Running Locally

**Prerequisites:** Python 3.10+, Node.js 18+, Docker Desktop

```bash
# Clone
git clone https://github.com/your-username/pulsepost
cd pulsepost

# Backend
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS/Linux

pip install -r requirements.txt

# Start Postgres + Redis
docker-compose up -d

# Copy env and fill in values
cp .env.example .env

# Run migrations
alembic upgrade head

# Start API
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)

# Frontend (separate terminal)
cd ui
npm install
npm run dev
# → http://localhost:5173
```

---

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/reset-password
GET    /api/auth/me

GET    /api/posts              (paginated, cached)
GET    /api/posts/feed         (personalized, auth required)
GET    /api/posts/search
GET    /api/posts/top          (most liked)
POST   /api/posts
PUT    /api/posts/{id}
DELETE /api/posts/{id}
POST   /api/posts/{id}/like
DELETE /api/posts/{id}/like
GET    /api/posts/{id}/comments
POST   /api/posts/{id}/comments

GET    /api/users/search
GET    /api/users/{id}
POST   /api/users/{id}/follow
DELETE /api/users/{id}/follow
GET    /api/users/{id}/followers
GET    /api/users/{id}/following
DELETE /api/users/me

WS     /ws?token=<access_token>
```

---

## Environment Variables

```bash
# .env (copy from .env.example)
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/pulsepost
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
REDIS_URL=redis://localhost:6379
ENVIRONMENT=development
DEBUG=true
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

---

## What's not included (Future Implementations)

- **Email verification** — password reset works without email for simplicity; a token-based email flow (SendGrid/Resend) is the natural next step
- **Kafka event streaming** — the architecture is designed for it (events fire on post/follow/like) but a message broker adds operational complexity not needed at this scale
- **File uploads / avatars** — S3 + boto3 integration is planned; initials-based avatars are used currently
- **Rate limiting** — would add slowapi middleware in production
