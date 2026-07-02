from datetime import datetime, timezone
from typing import Optional, Annotated
from pydantic import BaseModel, Field, EmailStr, BeforeValidator

# Custom type for handling MongoDB ObjectIds as strings in Pydantic V2
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserPreferences(BaseModel):
    preferred_state: str = ""
    preferred_city: str = ""
    preferred_course: str = ""
    category: str = "General"
    budget: float = 0.0
    marks_12: float = 0.0
    entrance_score: float = 0.0
    preferred_college_type: str = "All"

class UserDocument(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    full_name: str
    email: EmailStr
    password_hash: str
    role: str = "student"
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
