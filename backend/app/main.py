from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.routers import auth, colleges, saved, chat, planner, profile
from app.routers.colleges import seed_colleges_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MongoDB Atlas (or local fallback)
    await connect_to_mongo()
    
    # Auto-seed colleges collection with premium demo data if empty
    try:
        seeded_count = await seed_colleges_db()
        print(f"Database Initialization: Seeded {seeded_count} colleges.")
    except Exception as e:
        print(f"Database Initialization Warning: Seeding failed: {e}")
        
    yield
    # Clean up and close connection
    await close_mongo_connection()

app = FastAPI(
    title="CampusAI API",
    description="India's AI Admission Assistant Backend API - Phase 3 Complete Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Set up CORS middleware to allow cross-origin requests from our Vite React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from Vite server in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(colleges.router)
app.include_router(saved.router)
app.include_router(chat.router)
app.include_router(planner.router)
app.include_router(profile.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": "CampusAI",
        "tagline": "India's AI Admission Assistant",
        "phase": 3,
        "foundation": "working"
    }
