from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- College Schemas ---
class CollegeSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    college_type: str  # Engineering, Medical, Law, Arts, Commerce, etc.
    state: str
    city: str
    description: str
    courses: List[str] = []
    admission_process: str
    eligibility: str
    required_documents: List[str] = []
    approximate_fees: float
    official_website: str
    contact_information: str
    last_updated: Optional[datetime] = None

    class Config:
        populate_by_name = True

# --- Saved College Schemas ---
class SavedCollegeResponse(BaseModel):
    id: str
    user_id: str
    college_id: str
    saved_at: datetime
    college_details: Optional[Dict[str, Any]] = None

# --- Chat Counselor Schemas ---
class ChatQueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class ChatMessageSchema(BaseModel):
    sender: str  # "student" or "ai"
    message: str
    timestamp: datetime
    structured_data: Optional[Dict[str, Any]] = None

class ChatSessionSchema(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    messages: List[ChatMessageSchema] = []

# --- Admission Planner Schemas ---
class PlannerGenerateRequest(BaseModel):
    preferred_course: str
    preferred_state: str
    preferred_city: str
    marks_12: float
    entrance_score: Optional[float] = 0.0
    category: str
    budget: float
    preferred_college_type: str

class RoadmapStepSchema(BaseModel):
    step: int
    title: str
    details: str
    status: str  # "active", "pending", "completed"

class AdmissionRoadmapSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    preferred_course: str
    preferred_state: str
    preferred_city: str
    roadmap: List[RoadmapStepSchema]
    created_at: datetime

    class Config:
        populate_by_name = True
