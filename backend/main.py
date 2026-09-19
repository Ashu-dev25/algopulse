import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.problems import router as problems_router
from app.api.validator import router as validator_router
from app.api.sync import router as sync_router
from app.api.streak import router as streak_router

# 1) Configure application logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("algopulse.main")

# 2) Define async lifespan manager for database connection
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Step A: Connect to MongoDB on startup
    logger.info("Initializing AlgoPulse Backend (Phase 2)...")
    await connect_to_mongo()
    yield
    # Step B: Close MongoDB connection on shutdown
    logger.info("Shutting down AlgoPulse Backend...")
    await close_mongo_connection()

# 3) Initialize FastAPI application instance
app = FastAPI(
    title="AlgoPulse API - Phase 2",
    description="CRUD, authentication, strict URL validation, LeetCode sync, and streak engine",
    version="1.0.0",
    lifespan=lifespan
)

# 4) Configure CORS middleware for API access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5) Mount application routers under /api/v1
api_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_prefix)
app.include_router(users_router, prefix=api_prefix)
app.include_router(problems_router, prefix=api_prefix)
app.include_router(validator_router, prefix=api_prefix)
app.include_router(sync_router, prefix=api_prefix)
app.include_router(streak_router, prefix=api_prefix)

# 6) Root health check endpoint
@app.get("/")
async def root_health_check():
    return {
        "app": "AlgoPulse Backend",
        "phase": "Phase 2 - LeetCode Sync and Streak Engine",
        "status": "online",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }
