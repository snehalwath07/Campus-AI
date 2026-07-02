from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime, timezone
from app.database.mongodb import get_collection
from app.schemas.general import SavedCollegeResponse
from app.auth.jwt_handler import get_current_user
from app.models.user import UserDocument
from app.routers.colleges import map_college_document

router = APIRouter(prefix="/saved-colleges", tags=["saved-colleges"])

@router.get("", response_model=List[SavedCollegeResponse])
async def get_saved_colleges(current_user: UserDocument = Depends(get_current_user)):
    saved_col = get_collection("saved_colleges")
    colleges_col = get_collection("colleges")
    
    cursor = saved_col.find({"user_id": str(current_user.id)})
    bookmarks = []
    
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        # Aggregate college details
        college_doc = None
        try:
            college_oid = ObjectId(doc["college_id"])
            college_doc = await colleges_col.find_one({"_id": college_oid})
            if college_doc:
                college_doc = map_college_document(college_doc)
        except Exception:
            pass
            
        doc["college_details"] = college_doc
        bookmarks.append(SavedCollegeResponse(**doc))
        
    return bookmarks

@router.post("", response_model=SavedCollegeResponse, status_code=status.HTTP_201_CREATED)
async def bookmark_college(
    payload: dict, 
    current_user: UserDocument = Depends(get_current_user)
):
    college_id = payload.get("college_id")
    if not college_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="College identifier is required."
        )
        
    colleges_col = get_collection("colleges")
    saved_col = get_collection("saved_colleges")
    
    # 1. Verify college exists
    try:
        college_oid = ObjectId(college_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid college identifier format."
        )
        
    college = await colleges_col.find_one({"_id": college_oid})
    if not college:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="College not found."
        )
        
    # 2. Check if already bookmarked
    existing = await saved_col.find_one({
        "user_id": str(current_user.id),
        "college_id": college_id
    })
    
    if existing:
        # Already exists, just return it
        existing["id"] = str(existing["_id"])
        existing["college_details"] = map_college_document(college)
        return SavedCollegeResponse(**existing)
        
    # 3. Create new bookmark
    new_bookmark = {
        "user_id": str(current_user.id),
        "college_id": college_id,
        "saved_at": datetime.now(timezone.utc)
    }
    
    result = await saved_col.insert_one(new_bookmark)
    new_bookmark["id"] = str(result.inserted_id)
    new_bookmark["college_details"] = map_college_document(college)
    
    return SavedCollegeResponse(**new_bookmark)

@router.delete("/{college_id}")
async def remove_bookmark(college_id: str, current_user: UserDocument = Depends(get_current_user)):
    saved_col = get_collection("saved_colleges")
    
    result = await saved_col.delete_one({
        "user_id": str(current_user.id),
        "college_id": college_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark record not found."
        )
        
    return {"message": "Bookmark removed successfully."}
