import asyncio
import sys
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_collection
from app.services.ai_engine import process_student_query
from app.routers.colleges import seed_colleges_db
from app.routers.planner import generate_roadmap
from app.schemas.general import PlannerGenerateRequest
from app.models.user import UserDocument

async def run_verification():
    print("=========================================")
    print("CAMPUSAI PHASE 3 INTEGRITY VERIFICATION")
    print("=========================================")
    
    # 1. Connect to database and seed data
    print("\n1. Connecting to database and seeding collections...")
    try:
        await connect_to_mongo()
        seeded = await seed_colleges_db()
        print(f"   [OK] Seeding complete. Added {seeded} new college documents.")
    except Exception as e:
        print(f"   [ERROR] Connection failed: {e}")
        print("   Skipping database-dependent tests...")
        await close_mongo_connection()
        sys.exit(1)

    # 2. Test AI Knowledge Engine - Intent Routing and Database Matches
    print("\n2. Testing AI Counselor - Database Match Flow...")
    query_1 = "Tell me about IIT Delhi B.Tech fee structure"
    result_1 = await process_student_query(query_1)
    print(f"   Query: {query_1}")
    print(f"   Intent: {result_1['intent']}")
    
    if result_1["structured_data"] and result_1["structured_data"]["name"] == "IIT Delhi":
        print("   [OK] Database match succeeded! Found IIT Delhi details.")
        print(f"        Fees: Rs. {result_1['structured_data']['approximate_fees']}")
        print(f"        Official Website: {result_1['structured_data']['official_website']}")
    else:
        print("   [ERROR] College record not retrieved or mismatched!")
        sys.exit(1)

    # 3. Test AI Counselor - Guardrail Blocking
    print("\n3. Testing AI Counselor - Unrelated Query Guardrails...")
    query_2 = "Who is Virat Kohli and how many centuries does he have?"
    result_2 = await process_student_query(query_2)
    print(f"   Query: {query_2}")
    print(f"   Intent: {result_2['intent']}")
    print(f"   Response: {result_2['message']}")
    
    if "I can only assist with college admission related queries" in result_2["message"]:
        print("   [OK] Guardrail block triggered correctly!")
    else:
        print("   [ERROR] Guardrail failed to block unrelated query!")
        sys.exit(1)

    # 4. Test AI Counselor - Gemini/Reasoning Fallback
    print("\n4. Testing AI Counselor - Unknown College Fallback...")
    query_3 = "Show me criteria for Oxford University engineering"
    result_3 = await process_student_query(query_3)
    print(f"   Query: {query_3}")
    print(f"   Intent: {result_3['intent']}")
    print(f"   Response: {result_3['message']}")
    
    if result_3["message"] and not result_3["structured_data"]:
        print("   [OK] Gemini reasoning/simulation fallback executed successfully!")
    else:
        print("   [ERROR] Fallback flow failed!")
        sys.exit(1)

    # 5. Test Roadmap Generation
    print("\n5. Testing Admission Roadmap Generation...")
    # Mock request payload
    req = PlannerGenerateRequest(
        preferred_course="B.Tech Computer Science",
        preferred_state="Delhi",
        preferred_city="New Delhi",
        marks_12=88.5,
        entrance_score=150.0,
        category="General",
        budget=300000.0,
        preferred_college_type="Public"
    )
    
    # Mock user document
    mock_user = UserDocument(
        id="507f1f77bcf86cd799439011",
        full_name="Verification Student",
        email="verify@student.in",
        password_hash="N/A",
        role="student"
    )
    
    roadmap_res = await generate_roadmap(payload=req, current_user=mock_user)
    print(f"   Roadmap generated: {len(roadmap_res.roadmap)} steps found.")
    
    for step in roadmap_res.roadmap:
        print(f"      Step {step.step}: {step.title} -> Status: {step.status}")
        
    if len(roadmap_res.roadmap) == 6:
        print("   [OK] Admission Roadmap built successfully with all 6 required steps.")
    else:
        print("   [ERROR] Roadmap generation returned incomplete steps!")
        sys.exit(1)

    await close_mongo_connection()
    print("\n=========================================")
    print("ALL PHASE 3 BACKEND TESTS PASSED SUCCESS!")
    print("=========================================")

if __name__ == "__main__":
    asyncio.run(run_verification())
