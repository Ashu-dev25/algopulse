import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("algopulse.database")

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

async def get_db() -> AsyncIOMotorDatabase:
    """
    Returns active MongoDB database connection handle.
    """
    # 1) Return the shared database instance
    return db_instance.db

async def connect_to_mongo():
    """
    Initializes async MongoDB client connection and creates lean indexes.
    """
    logger.info(f"Connecting to MongoDB at: {settings.MONGODB_URL}")
    
    # 1) Create AsyncIOMotorClient instance with 5s timeout
    db_instance.client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        serverSelectionTimeoutMS=5000
    )
    
    # 2) Select configured database
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    
    # 3) Initialize essential indexes for fast queries and low storage usage
    try:
        # Users Collection: unique username and email
        await db_instance.db.users.create_index("username", unique=True)
        await db_instance.db.users.create_index("email", unique=True)
        
        # Problems Collection: fast filtering by status, platform, and date
        await db_instance.db.problems.create_index([("user_id", 1), ("platform", 1), ("p_id", 1)], unique=True)
        await db_instance.db.problems.create_index([("user_id", 1), ("status", 1)])
        await db_instance.db.problems.create_index([("user_id", 1), ("solved_at", -1)])
        
        # Daily Streaks Collection: fast daily and monthly aggregation
        await db_instance.db.daily_streaks.create_index([("user_id", 1), ("date", 1)], unique=True)
        await db_instance.db.daily_streaks.create_index([("user_id", 1), ("month", 1)])
        
        # Submissions Collection: deduplication index
        await db_instance.db.submissions.create_index([("user_id", 1), ("sub_id", 1)], unique=True)
        
        logger.info("MongoDB indexes verified successfully.")
    except Exception as e:
        logger.warning(f"Note on MongoDB index initialization: {e}")

async def close_mongo_connection():
    """
    Closes the async MongoDB connection pool on shutdown.
    """
    # 1) Check if client is active
    if db_instance.client:
        logger.info("Closing MongoDB connection pool...")
        # 2) Close database client connection
        db_instance.client.close()
        logger.info("MongoDB connection closed.")
