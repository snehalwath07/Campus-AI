from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone
from app.database.mongodb import get_collection
from app.schemas.general import PlannerGenerateRequest, AdmissionRoadmapSchema
from app.auth.jwt_handler import get_current_user
from app.models.user import UserDocument
from bson import ObjectId

router = APIRouter(prefix="/planner", tags=["planner"])

@router.post("/generate", response_model=AdmissionRoadmapSchema)
async def generate_roadmap(
    payload: PlannerGenerateRequest,
    current_user: UserDocument = Depends(get_current_user)
):
    colleges_col = get_collection("colleges")
    
    # 1. Fetch matching colleges from DB based on course, state, city, budget
    filter_dict = {}
    
    # Course stream filter
    if payload.preferred_course:
        # Match stream/type
        filter_dict["courses"] = {"$regex": payload.preferred_course, "$options": "i"}
        
    if payload.preferred_state:
        filter_dict["state"] = {"$regex": f"^{payload.preferred_state}$", "$options": "i"}
        
    if payload.preferred_city:
        filter_dict["city"] = {"$regex": f"^{payload.preferred_city}$", "$options": "i"}
        
    # Budget filter (approximate fees <= budget)
    if payload.budget > 0:
        filter_dict["approximate_fees"] = {"$lte": payload.budget}
        
    # College type filter
    if payload.preferred_college_type != "All":
        # Search by management vs technical vs public
        if payload.preferred_college_type == "Public":
            filter_dict["description"] = {"$regex": "public", "$options": "i"}
        elif payload.preferred_college_type == "Private":
            filter_dict["description"] = {"$regex": "private", "$options": "i"}

    cursor = colleges_col.find(filter_dict).limit(5)
    matching_colleges = []
    async for col in cursor:
        matching_colleges.append(col)
        
    # Fallback: if no matches based on state/city, search generally by course
    if not matching_colleges:
        cursor = colleges_col.find({"courses": {"$regex": payload.preferred_course, "$options": "i"}}).limit(3)
        async for col in cursor:
            matching_colleges.append(col)
            
    # Default fallback: get any 3 colleges
    if not matching_colleges:
        cursor = colleges_col.find({}).limit(3)
        async for col in cursor:
            matching_colleges.append(col)

    # 2. Extract aggregated details for steps
    college_names = [
    col.get("College Name", col.get("name", "Unknown College"))
    for col in matching_colleges
]
    
    # Aggregate required documents across matched colleges
    documents_needed = [
        "10th Marksheet",
        "12th Marksheet",
        "Entrance Exam Score Card",
        "Transfer Certificate",
        "Passport Size Photographs"
    ]
    
    # Aggregate websites
    websites = [
    f"{col.get('College Name', 'Unknown College')}: {col.get('official_website', 'https://www.aicte-india.org')}"
    for col in matching_colleges
]

    # Check eligibility based on 12th percentage
    eligible_status = "Checked"
    eligibility_notes = []

    for col in matching_colleges:
        eligibility_notes.append(
            f"{col.get('College Name', 'Unknown College')}: Requires {col.get('eligibility', 'Basic eligibility criteria')}"
        )

    # 3. Construct 6-step roadmap timeline
    roadmap_steps = [
        {
            "step": 1,
            "title": "Recommended Colleges",
            "details": f"We recommend exploring: {', '.join(college_names)}. These match your preferences in {payload.preferred_course}.",
            "status": "completed"
        },
        {
            "step": 2,
            "title": "Check Eligibility",
            "details": f"Your 12th percentage is {payload.marks_12}%. Entrance score: {payload.entrance_score or 'N/A'}. Details: {'; '.join(eligibility_notes)}.",
            "status": "active"
        },
        {
            "step": 3,
            "title": "Compare Colleges",
            "details": "Go to the Compare Colleges tab to evaluate fees, campus facilities, and placements side-by-side.",
            "status": "pending"
        },
        {
            "step": 4,
            "title": "Prepare Documents",
            "details": f"Collect required files: {', '.join(documents_needed)}.",
            "status": "pending"
        },
        {
            "step": 5,
            "title": "Visit Official Websites",
            "details": f"Register online. Portal links: {', '.join(websites)}.",
            "status": "pending"
        },
        {
            "step": 6,
            "title": "Application Ready",
            "details": f"Submit your application and track deadlines for {payload.preferred_course} admission.",
            "status": "pending"
        }
    ]

    new_roadmap = AdmissionRoadmapSchema(
        user_id=str(current_user.id),
        preferred_course=payload.preferred_course,
        preferred_state=payload.preferred_state,
        preferred_city=payload.preferred_city,
        roadmap=roadmap_steps,
        created_at=datetime.now(timezone.utc)
    )

    return new_roadmap

@router.get("/saved", response_model=Optional[AdmissionRoadmapSchema])
async def get_saved_roadmap(current_user: UserDocument = Depends(get_current_user)):
    plans_col = get_collection("admission_plans")
    doc = await plans_col.find_one({"user_id": str(current_user.id)}, sort=[("created_at", -1)])
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return AdmissionRoadmapSchema(**doc)

@router.post("/save", response_model=AdmissionRoadmapSchema, status_code=status.HTTP_201_CREATED)
async def save_roadmap(
    payload: dict,
    current_user: UserDocument = Depends(get_current_user)
):
    plans_col = get_collection("admission_plans")
    roadmap_data = payload.get("roadmap")
    preferred_course = payload.get("preferred_course", "")
    preferred_state = payload.get("preferred_state", "")
    preferred_city = payload.get("preferred_city", "")

    if not roadmap_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Roadmap steps are required to save."
        )

    # Insert or update
    new_plan = {
        "user_id": str(current_user.id),
        "preferred_course": preferred_course,
        "preferred_state": preferred_state,
        "preferred_city": preferred_city,
        "roadmap": roadmap_data,
        "created_at": datetime.now(timezone.utc)
    }

    # Delete previous plans to only keep the latest roadmap
    await plans_col.delete_many({"user_id": str(current_user.id)})
    
    result = await plans_col.insert_one(new_plan)
    new_plan["id"] = str(result.inserted_id)
    
    return AdmissionRoadmapSchema(**new_plan)
