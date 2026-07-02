from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timezone
from app.database.mongodb import get_collection
from app.schemas.general import CollegeSchema
from app.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/colleges", tags=["colleges"])

# Demo data list for seeding
DEMO_COLLEGES = [
    {
        "name": "IIT Delhi",
        "college_type": "Engineering",
        "state": "Delhi",
        "city": "New Delhi",
        "description": "Indian Institute of Technology Delhi is a public technical university located in New Delhi, India. It is one of the oldest IITs in India.",
        "courses": ["B.Tech Computer Science", "B.Tech Electrical Engineering", "M.Tech Data Science", "B.Arch Architecture"],
        "admission_process": "Admissions are granted via national entrance exams. Students must clear JEE Main followed by JEE Advanced, and participate in JoSAA counselling.",
        "eligibility": "Minimum 75% in 12th Board examinations (Physics, Chemistry, Mathematics) and a valid JEE Advanced merit listing rank.",
        "required_documents": ["10th Class Marksheet", "12th Class Marksheet", "JEE Advanced Admit Card", "JEE Advanced Scorecard", "JoSAA Seat Allocation Letter", "Category Certificate (if applicable)"],
        "approximate_fees": 220000.0,
        "official_website": "https://home.iitd.ac.in",
        "contact_information": "admissions@admin.iitd.ac.in | +91 11 2659 1000",
    },
    {
        "name": "IIT Bombay",
        "college_type": "Engineering",
        "state": "Maharashtra",
        "city": "Mumbai",
        "description": "Indian Institute of Technology Bombay is a leading public engineering institute situated in Powai, Mumbai. Renowned for its research and startup culture.",
        "courses": ["B.Tech Computer Science", "B.Tech Mechanical Engineering", "B.Tech Aerospace Engineering", "M.Sc Chemistry"],
        "admission_process": "JEE Main followed by JEE Advanced merit listing, followed by seat allocation via JoSAA.",
        "eligibility": "Minimum 75% aggregate marks in 12th Board exams (PCM) and qualifying rank in JEE Advanced.",
        "required_documents": ["10th Marksheet", "12th Marksheet", "JEE Advanced Scorecard", "Seat Confirmation Certificate", "Medical Certificate"],
        "approximate_fees": 230000.0,
        "official_website": "https://www.iitb.ac.in",
        "contact_information": "gateoffice@iitb.ac.in | +91 22 2572 2545",
    },
    {
        "name": "BITS Pilani",
        "college_type": "Engineering",
        "state": "Rajasthan",
        "city": "Pilani",
        "description": "Birla Institute of Technology & Science, Pilani is a premium private deemed technical university in Rajasthan, India, noted for its 'no-reservation' policy.",
        "courses": ["B.E. Computer Science", "B.E. Electronics & Communication", "B.Pharm Pharmacy", "M.B.A. Technology Management"],
        "admission_process": "Admissions are strictly merit-based, determined by scores obtained in the university's BITSAT entrance examination.",
        "eligibility": "Minimum 75% aggregate marks in Physics, Chemistry, and Mathematics/Biology in 12th, with at least 60% in each subject.",
        "required_documents": ["12th Board Marksheet", "BITSAT Scorecard", "Identification Proof", "Transfer Certificate"],
        "approximate_fees": 510000.0,
        "official_website": "https://www.bits-pilani.ac.in",
        "contact_information": "admissions@pilani.bits-pilani.ac.in | +91 15 9624 5073",
    },
    {
        "name": "IIM Ahmedabad",
        "college_type": "Management",
        "state": "Gujarat",
        "city": "Ahmedabad",
        "description": "Indian Institute of Management Ahmedabad is India's top business school. Established in 1961, it is famous for its rigorous PGP curriculum.",
        "courses": ["Post Graduate Programme (MBA)", "PGP in Food and Agri-Business (FABM)", "Executive MBA (PGPX)"],
        "admission_process": "Candidates must clear the Common Admission Test (CAT) with top percentiles, followed by Written Analysis and Personal Interview (AWT-PI) rounds.",
        "eligibility": "Bachelor's degree with a minimum of 50% marks or equivalent CGPA, along with high CAT percentiles.",
        "required_documents": ["CAT Scorecard", "10th/12th Marksheets", "Graduation Degree Certificates", "Work Experience Letters (if applicable)", "Interview Call Letter"],
        "approximate_fees": 1250000.0,
        "official_website": "https://www.iima.ac.in",
        "contact_information": "admissionquery@iima.ac.in | +91 79 7152 0000",
    },
    {
        "name": "AIIMS New Delhi",
        "college_type": "Medical",
        "state": "Delhi",
        "city": "New Delhi",
        "description": "All India Institute of Medical Sciences New Delhi is a public medical research university and hospital, ranking as the premier medical institute in South Asia.",
        "courses": ["M.B.B.S. Medicine", "B.Sc Nursing", "M.D. Pediatrics", "M.S. General Surgery"],
        "admission_process": "Students must qualify in the National Eligibility cum Entrance Test (NEET-UG) and participate in MCC online counselling.",
        "eligibility": "Minimum 60% aggregate in 12th Board exams (Physics, Chemistry, Biology, and English) and qualifying rank in NEET-UG.",
        "required_documents": ["NEET-UG Scorecard", "10th & 12th Marksheets", "NEET Admit Card", "Counselling Allocation Certificate", "Migration Certificate"],
        "approximate_fees": 1628.0,
        "official_website": "https://www.aiims.edu",
        "contact_information": "registrar@aiims.edu | +91 11 2658 8500",
    },
    {
        "name": "NLSIU Bengaluru",
        "college_type": "Law",
        "state": "Karnataka",
        "city": "Bengaluru",
        "description": "National Law School of India University is an elite law school established in Bengaluru. It is consistently ranked as the top law university in India.",
        "courses": ["B.A. LL.B. (Hons)", "LL.M. Business Law", "Master of Public Policy (MPP)"],
        "admission_process": "Admissions are decided based on national ranking in the Common Law Admission Test (CLAT).",
        "eligibility": "Minimum 45% marks in 12th Board examinations (or equivalent CGPA) and valid CLAT score.",
        "required_documents": ["CLAT Scorecard", "12th Marksheet", "CLAT Admit Card", "Allocation Letter", "Character Certificate"],
        "approximate_fees": 320000.0,
        "official_website": "https://www.nls.ac.in",
        "contact_information": "admissions@nls.ac.in | +91 80 2316 0532",
    },
    {
        "name": "LSR College",
        "college_type": "Arts",
        "state": "Delhi",
        "city": "New Delhi",
        "description": "Lady Shri Ram College for Women is a premier constituent women's college of the University of Delhi, offering high rankings in Humanities and Commerce.",
        "courses": ["B.A. Economics (Hons)", "B.A. English (Hons)", "B.Com Commerce (Hons)", "M.A. History"],
        "admission_process": "Admissions are governed by scores in the Common University Entrance Test (CUET) followed by CSAS seat allocation.",
        "eligibility": "12th board clearance and merit performance score in CUET examinations.",
        "required_documents": ["CUET Scorecard", "Class 10 & 12 Marksheets", "CUET Admit Card", "CSAS Registration Sheet"],
        "approximate_fees": 24000.0,
        "official_website": "https://lsr.edu.in",
        "contact_information": "principal@lsr.edu.in | +91 11 2643 4459",
    },
    {
        "name": "NID Ahmedabad",
        "college_type": "Design",
        "state": "Gujarat",
        "city": "Ahmedabad",
        "description": "National Institute of Design Ahmedabad is a design school ranked among the top design institutions in Asia. An Institute of National Importance.",
        "courses": ["Bachelor of Design (B.Des)", "Master of Design (M.Des)"],
        "admission_process": "Candidates must pass NID DAT Prelims followed by NID DAT Mains (Studio Test and Interview).",
        "eligibility": "Passed or appearing in 12th standard examinations in any stream (Science, Arts, Commerce).",
        "required_documents": ["NID DAT Scorecard", "10th/12th Class Marksheets", "Portfolio (for interview)", "Admit Card"],
        "approximate_fees": 360000.0,
        "official_website": "https://www.nid.edu",
        "contact_information": "admissions@nid.edu | +91 79 2662 9500",
    },
    {
        "name": "Government Polytechnic Mumbai",
        "college_type": "Diploma",
        "state": "Maharashtra",
        "city": "Mumbai",
        "description": "Government Polytechnic Mumbai is a premium autonomous polytechnic institute offering engineering diplomas under the DTE Maharashtra.",
        "courses": ["Diploma in Computer Engineering", "Diploma in Information Technology", "Diploma in Civil Engineering"],
        "admission_process": "Admissions are merit-based, calculated on 10th standard board percentage via CAP rounds by DTE Maharashtra.",
        "eligibility": "Completed 10th standard with a minimum of 35% aggregate in mathematics and science.",
        "required_documents": ["10th Class Marksheet", "School Leaving Certificate", "DTE Registration Form", "Domicile Certificate"],
        "approximate_fees": 12000.0,
        "official_website": "https://www.gpmumbai.ac.in",
        "contact_information": "gpmumbai@gpmumbai.ac.in | +91 22 2642 3916",
    }
]

async def seed_colleges_db():
    colleges_col = get_collection("colleges")
    count = await colleges_col.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc)
        to_insert = []
        for college in DEMO_COLLEGES:
            doc = college.copy()
            doc["last_updated"] = now
            to_insert.append(doc)
        await colleges_col.insert_many(to_insert)
        return len(to_insert)
    return 0

@router.post("/seed", status_code=status.HTTP_201_CREATED)
async def seed_data(current_user=Depends(get_current_user)):
    seeded = await seed_colleges_db()
    return {"message": f"Successfully seeded {seeded} colleges into database."}

def map_college_document(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return {
        "_id": doc["_id"],
        "id": doc["_id"],
        "name": doc.get("College Name") or doc.get("name") or "Unknown College",
        "college_type": doc.get("Type") or doc.get("college_type") or "Not Available",
        "state": doc.get("state") or "Maharashtra",
        "city": doc.get("District") or doc.get("city") or "Not Available",
        "description": doc.get("Address") or doc.get("description") or "Not Available",
        "courses": doc.get("courses") or ["Engineering"],
        "admission_process": doc.get("admission_process") or "Admissions are conducted according to AICTE / State CET counselling process.",
        "eligibility": doc.get("eligibility") or "Candidate should satisfy the eligibility criteria prescribed by the admission authority.",
        "required_documents": doc.get("required_documents") or [
            "10th Marksheet",
            "12th Marksheet",
            "Entrance Score Card",
            "Transfer Certificate",
            "Category Certificate (if applicable)"
        ],
        "approximate_fees": float(doc.get("approximate_fees") or 100000.0),
        "official_website": doc.get("official_website") or "https://www.aicte-india.org",
        "contact_information": doc.get("contact_information") or doc.get("Address") or "Not Available",
        "last_updated": doc.get("last_updated")
    }

@router.get("", response_model=List[CollegeSchema])
async def get_colleges(
    query: Optional[str] = None,
    stream: Optional[str] = None,
    state: Optional[str] = None,
    city: Optional[str] = None
):
    colleges_col = get_collection("colleges")
    filter_dict = {}
    
    if query:
        filter_dict["$or"] = [
            {"name": {"$regex": query, "$options": "i"}},
            {"College Name": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"Address": {"$regex": query, "$options": "i"}},
            {"courses": {"$regex": query, "$options": "i"}},
            {"District": {"$regex": query, "$options": "i"}}
        ]
        
    if stream:
        filter_dict["$or"] = [
            {"college_type": {"$regex": f"^{stream}$", "$options": "i"}},
            {"Type": {"$regex": f"^{stream}$", "$options": "i"}}
        ]
        
    if state:
        filter_dict["state"] = {"$regex": f"^{state}$", "$options": "i"}
        
    if city:
        filter_dict["$or"] = [
            {"city": {"$regex": f"^{city}$", "$options": "i"}},
            {"District": {"$regex": f"^{city}$", "$options": "i"}}
        ]
        
    cursor = colleges_col.find(filter_dict)
    colleges = []
    async for doc in cursor:
        colleges.append(map_college_document(doc))
        
    return colleges

@router.get("/{college_id}", response_model=CollegeSchema)
async def get_college_by_id(college_id: str, current_user=Depends(get_current_user)):
    colleges_col = get_collection("colleges")
    try:
        oid = ObjectId(college_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid college identifier structure."
        )
        
    college = await colleges_col.find_one({"_id": oid})
    if not college:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="College not found."
        )
        
    return map_college_document(college)
