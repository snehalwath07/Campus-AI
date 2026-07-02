import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

logger = logging.getLogger("campusai.database")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_helper = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    try:
        # Create client
        db_helper.client = AsyncIOMotorClient(settings.MONGODB_URI)
        db_helper.db = db_helper.client[settings.DATABASE_NAME]
        
        # Verify connection
        await db_helper.client.admin.command('ping')
        logger.info("Connected to MongoDB successfully!")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # We don't crash the server on startup to allow local testing and env modifications, 
        # but we log the error.
        raise e

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_helper.client:
        db_helper.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db_helper.db

def get_collection(name: str):
    db = get_database()
    if db is None:
        raise RuntimeError("Database connection not initialized. Please call connect_to_mongo first.")
    return db[name]
