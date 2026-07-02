from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timezone
from app.database.mongodb import get_collection
from app.schemas.general import ChatSessionSchema, ChatQueryRequest, ChatMessageSchema
from app.auth.jwt_handler import get_current_user
from app.models.user import UserDocument
from app.services.ai_engine import process_student_query

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/sessions", response_model=List[ChatSessionSchema])
async def get_sessions(current_user: UserDocument = Depends(get_current_user)):
    chat_col = get_collection("chat_history")
    
    cursor = chat_col.find({"user_id": str(current_user.id)}).sort("created_at", -1)
    sessions = []
    
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        # Format datetimes to string/Pydantic-compliant ISO format
        if "created_at" in doc and doc["created_at"]:
            doc["created_at"] = doc["created_at"].replace(tzinfo=timezone.utc)
        for msg in doc.get("messages", []):
            if "timestamp" in msg and msg["timestamp"]:
                msg["timestamp"] = msg["timestamp"].replace(tzinfo=timezone.utc)
        sessions.append(ChatSessionSchema(**doc))
        
    return sessions

@router.get("/sessions/{session_id}", response_model=ChatSessionSchema)
async def get_session(session_id: str, current_user: UserDocument = Depends(get_current_user)):
    chat_col = get_collection("chat_history")
    try:
        oid = ObjectId(session_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid chat session format."
        )
        
    session = await chat_col.find_one({"_id": oid, "user_id": str(current_user.id)})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found."
        )
        
    session["id"] = str(session["_id"])
    if "created_at" in session and session["created_at"]:
        session["created_at"] = session["created_at"].replace(tzinfo=timezone.utc)
    for msg in session.get("messages", []):
        if "timestamp" in msg and msg["timestamp"]:
            msg["timestamp"] = msg["timestamp"].replace(tzinfo=timezone.utc)
            
    return ChatSessionSchema(**session)

@router.post("/query")
async def ask_counselor(
    payload: ChatQueryRequest,
    current_user: UserDocument = Depends(get_current_user)
):
    query = payload.query
    session_id = payload.session_id
    chat_col = get_collection("chat_history")
    
    # 1. Process query via hybrid AI counselor engine
    ai_result = await process_student_query(query)
    
    now = datetime.now(timezone.utc)
    
    # User message
    user_msg = {
        "sender": "student",
        "message": query,
        "timestamp": now,
        "structured_data": None
    }
    
    # AI message
    ai_msg = {
        "sender": "ai",
        "message": ai_result["message"],
        "timestamp": now,
        "structured_data": ai_result["structured_data"]
    }
    
    # 2. Save in database
    if session_id:
        try:
            oid = ObjectId(session_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid chat session format."
            )
            
        session_exists = await chat_col.find_one({"_id": oid, "user_id": str(current_user.id)})
        if not session_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target chat session not found."
            )
            
        await chat_col.update_one(
            {"_id": oid},
            {"$push": {"messages": {"$each": [user_msg, ai_msg]}}}
        )
        active_session_id = session_id
    else:
        # Create new session
        title = query[:35] + ("..." if len(query) > 35 else "")
        new_session = {
            "user_id": str(current_user.id),
            "title": title,
            "created_at": now,
            "messages": [user_msg, ai_msg]
        }
        result = await chat_col.insert_one(new_session)
        active_session_id = str(result.inserted_id)
        
    return {
        "session_id": active_session_id,
        "response": ai_result["message"],
        "structured_data": ai_result["structured_data"]
    }

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user: UserDocument = Depends(get_current_user)):
    chat_col = get_collection("chat_history")
    try:
        oid = ObjectId(session_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid chat session format."
        )
        
    result = await chat_col.delete_one({"_id": oid, "user_id": str(current_user.id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found."
        )
        
    return {"message": "Chat session deleted successfully."}
