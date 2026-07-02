from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.database.mongodb import get_collection
from app.models.user import UserDocument, UserPreferences
from app.schemas.auth import (
    UserSignup, UserLogin, UserResponse, TokenResponse,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.utils.security import (
    hash_password, verify_password, create_access_token, decode_access_token
)
from app.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserSignup):
    users_col = get_collection("users")
    
    # Check if user already exists
    existing_user = await users_col.find_one({"email": payload.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    # Create new user document
    hashed_pw = hash_password(payload.password)
    new_user = UserDocument(
        full_name=payload.full_name,
        email=payload.email.lower(),
        password_hash=hashed_pw,
        role="student",
        preferences=UserPreferences(
            preferred_state="",
            preferred_city="",
            preferred_course=""
        )
    )
    
    user_dict = new_user.model_dump(by_alias=True)
    # Remove None id so MongoDB generates the _id field
    if user_dict["_id"] is None:
        user_dict.pop("_id")
        
    result = await users_col.insert_one(user_dict)
    
    # Retrieve inserted user to get generated id
    inserted_user = await users_col.find_one({"_id": result.inserted_id})
    user_doc = UserDocument(**inserted_user)
    
    # Generate access token
    access_token = create_access_token(data={"sub": user_doc.email})
    
    user_response = UserResponse(
        id=str(user_doc.id),
        full_name=user_doc.full_name,
        email=user_doc.email,
        role=user_doc.role,
        preferences=user_doc.preferences
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    users_col = get_collection("users")
    
    # Check if user exists
    user_data = await users_col.find_one({"email": payload.email.lower()})
    if not user_data or not verify_password(payload.password, user_data["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    user_doc = UserDocument(**user_data)
    
    # Update last login time
    now = datetime.now(timezone.utc)
    await users_col.update_one(
        {"_id": user_data["_id"]},
        {"$set": {"last_login": now, "updated_at": now}}
    )
    
    # Create access token (adjust expiration if remember me is checked)
    expires_delta = timedelta(days=30) if payload.remember_me else timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user_doc.email},
        expires_delta=expires_delta
    )
    
    user_response = UserResponse(
        id=str(user_doc.id),
        full_name=user_doc.full_name,
        email=user_doc.email,
        role=user_doc.role,
        preferences=user_doc.preferences
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.post("/logout")
async def logout():
    # Stateless logout. Frontend will discard the JWT.
    return {"message": "Logged out successfully."}

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    users_col = get_collection("users")
    user_data = await users_col.find_one({"email": payload.email.lower()})
    
    # For security reasons, don't reveal if user does not exist.
    # However, return the reset URL inside the response for Phase 1 dev verification.
    if not user_data:
        return {
            "message": "If this email is registered, a password reset link has been generated.",
            "dev_notice": "Email not found in database."
        }
    
    # Create a password reset JWT token valid for 15 minutes
    reset_token = create_access_token(
        data={"sub": payload.email.lower(), "type": "reset_password"},
        expires_delta=timedelta(minutes=15)
    )
    
    return {
        "message": "If this email is registered, a password reset link has been generated.",
        "reset_token": reset_token,
        "reset_url": f"/reset-password?token={reset_token}"
    }

@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    token_payload = decode_access_token(payload.token)
    if not token_payload or token_payload.get("type") != "reset_password":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )
        
    email = token_payload.get("sub")
    users_col = get_collection("users")
    user_data = await users_col.find_one({"email": email})
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with this token was not found."
        )
        
    # Update password and timestamps
    hashed_pw = hash_password(payload.password)
    now = datetime.now(timezone.utc)
    await users_col.update_one(
        {"_id": user_data["_id"]},
        {"$set": {"password_hash": hashed_pw, "updated_at": now}}
    )
    
    return {"message": "Password updated successfully. You can now log in with your new password."}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserDocument = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        full_name=current_user.full_name,
        email=current_user.email,
        role=current_user.role,
        preferences=current_user.preferences
    )
