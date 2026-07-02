import asyncio
import sys
from app.config.settings import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_collection
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.user import UserDocument, UserPreferences

async def verify_auth_system():
    print("=========================================")
    print("CAMPUSAI AUTHENTICATION INTEGRITY TEST")
    print("=========================================")
    
    # 1. Test Password Hashing and Verification
    print("\n1. Testing Hashing and Verification...")
    test_password = "SecurePassword123!"
    hashed = hash_password(test_password)
    print(f"   Password: {test_password}")
    print(f"   Hashed:   {hashed}")
    
    match = verify_password(test_password, hashed)
    print(f"   Verification match: {match}")
    if not match:
        print("   [ERROR] Password verification failed!")
        sys.exit(1)
    print("   [OK] Password hashing matches successfully!")

    # 2. Test JWT Token Generation and Decoding
    print("\n2. Testing JWT Access Token Flow...")
    payload = {"sub": "test@college.edu.in", "role": "student"}
    token = create_access_token(data=payload)
    print(f"   Generated Token: {token[:30]}...{token[-30:]}")
    
    decoded = decode_access_token(token)
    print(f"   Decoded Payload: {decoded}")
    if not decoded or decoded.get("sub") != payload["sub"]:
        print("   [ERROR] JWT decode payload mismatch or signature invalid!")
        sys.exit(1)
    print("   [OK] JWT generated and decoded successfully!")

    # 3. Test MongoDB Database Connection and Demo Account Creation
    print("\n3. Testing MongoDB Connection and Creating Demo Student Account...")
    try:
        await connect_to_mongo()
        users_col = get_collection("users")
        
        demo_email = "aarav@college.edu.in"
        # Check if demo account exists
        existing = await users_col.find_one({"email": demo_email})
        
        if existing:
            print(f"   Demo student account already exists for {demo_email}.")
            # Update password
            await users_col.update_one(
                {"email": demo_email},
                {"$set": {
                    "password_hash": hash_password("SecurePassword123!"),
                    "full_name": "Aarav Sharma"
                }}
            )
            print("   [OK] Demo student account updated with default password.")
        else:
            demo_user = UserDocument(
                full_name="Aarav Sharma",
                email=demo_email,
                password_hash=hash_password("SecurePassword123!"),
                role="student",
                preferences=UserPreferences(
                    preferred_state="Maharashtra",
                    preferred_city="Mumbai",
                    preferred_course="Computer Science & Engineering"
                )
            )
            user_dict = demo_user.model_dump(by_alias=True)
            if user_dict["_id"] is None:
                user_dict.pop("_id")
                
            await users_col.insert_one(user_dict)
            print(f"   [OK] Demo student account created successfully: {demo_email}")
            
        # Verify from database
        user_in_db = await users_col.find_one({"email": demo_email})
        print(f"   User record fetched from database: {user_in_db['full_name']} ({user_in_db['email']})")
        print(f"   Preferences: {user_in_db.get('preferences')}")
        
    except Exception as e:
        print(f"   [ERROR] Database integration failed: {e}")
        print("   Make sure local MongoDB is running, or check MONGODB_URI in your .env configuration.")
    finally:
        await close_mongo_connection()
        
    print("\n=========================================")
    print("INTEGRITY CHECKS COMPLETED SUCCESSFULLY!")
    print("=========================================")

if __name__ == "__main__":
    asyncio.run(verify_auth_system())
