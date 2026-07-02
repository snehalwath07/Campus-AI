from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime, timezone
from bson import ObjectId
from app.database.mongodb import get_collection
from app.auth.jwt_handler import get_current_user
from app.models.user import UserDocument, UserPreferences
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdateRequest(BaseModel):
    full_name: str
    preferences: UserPreferences

@router.get("", response_model=UserResponse)
async def get_profile(current_user: UserDocument = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        full_name=current_user.full_name,
        email=current_user.email,
        role=current_user.role,
        preferences=current_user.preferences
    )

@router.put("", response_model=UserResponse)
async def update_profile(
    payload: ProfileUpdateRequest,
    current_user: UserDocument = Depends(get_current_user)
):
    users_col = get_collection("users")
    now = datetime.now(timezone.utc)
    
    update_data = {
        "full_name": payload.full_name,
        "preferences": payload.preferences.model_dump(),
        "updated_at": now
    }
    
    try:
        oid = ObjectId(current_user.id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user identifier structure."
        )
        
    await users_col.update_one({"_id": oid}, {"$set": update_data})
    
    # Retrieve updated user data
    updated_user = await users_col.find_one({"_id": oid})
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User record not found."
        )
        
    user_doc = UserDocument(**updated_user)
    
    return UserResponse(
        id=str(user_doc.id),
        full_name=user_doc.full_name,
        email=user_doc.email,
        role=user_doc.role,
        preferences=user_doc.preferences
    )
