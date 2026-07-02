import re
from typing import Dict, Any, Optional, List
from app.database.mongodb import get_collection
from app.services.gemini_service import generate_gemini_content

# Guardrail: Non-admission block list
BLOCK_KEYWORDS = [
    r"\bvirat\s+kohli\b", r"\bcricket\b", r"\bweather\b", r"\brecipe\b", 
    r"\bsong\b", r"\bmovie\b", r"\bpolitics\b", r"\bcooking\b", 
    r"\bfootball\b", r"\bgaming\b", r"\bwho\s+is\s+dhoni\b",
    r"\bhow\s+to\s+cook\b", r"\bactor\b"
]

# Intent keywords
INTENT_PATTERNS = {
    "compare": [r"\bcompare\b", r"\bvs\b", r"\bdifference\b"],
    "suggest": [r"\bsuggest\b", r"\brecommend\b", r"\bfind\b", r"\bwhich\s+college\b"],
    "fees": [r"\bfees\b", r"\bcost\b", r"\bexpense\b", r"\bcharge\b", r"\bfee\b"],
    "eligibility": [r"\beligibility\b", r"\beligible\b", r"\bqualification\b", r"\bmarks\b", r"\bcut-off\b", r"\bcutoff\b"],
    "documents": [r"\bdocuments\b", r"\bdocument\b", r"\bcertificates\b", r"\bwhat\s+do\s+i\s+need\b"],
    "admission": [r"\badmission\b", r"\badmissions\b", r"\bhow\s+to\s+apply\b", r"\bprocess\b", r"\bprocedure\b"],
    "course": [r"\bcourse\b", r"\bcourses\b", r"\bbranch\b", r"\bdegree\b"],
    "college_info": [r"\babout\b", r"\binfo\b", r"\binformation\b", r"\bdetails\b", r"\bshow\s+me\b"]
}

# Known colleges mapping for simple entity extraction
KNOWN_COLLEGES = [
    "IIT Delhi", "IIT Bombay", "IIM Ahmedabad", "AIIMS New Delhi", 
    "NLSIU Bengaluru", "BITS Pilani", "LSR College", "NID Ahmedabad",
    "Government Polytechnic Mumbai"
]

def detect_intent(query: str) -> str:
    """Classifies user intent using keyword patterns."""
    query_lower = query.lower()
    
    # Check guardrails first
    for pattern in BLOCK_KEYWORDS:
        if re.search(pattern, query_lower):
            return "unrelated"
            
    # Check other intents
    for intent, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, query_lower):
                return intent
                
    return "general"

def extract_entities(query: str) -> Dict[str, Any]:
    """Extracts entities like colleges, states, or courses."""
    query_lower = query.lower()
    extracted = {
        "college": None,
        "course": None,
        "state": None,
    }
    
    # 1. Match known colleges
    for college in KNOWN_COLLEGES:
        if college.lower() in query_lower:
            extracted["college"] = college
            break
            
    # 2. Match common states
    states = ["delhi", "maharashtra", "gujarat", "rajasthan", "karnataka", "tamil nadu", "uttar pradesh"]
    for state in states:
        if state in query_lower:
            extracted["state"] = state.title()
            break
            
    # 3. Match common courses
    courses = ["b.tech", "btech", "mba", "m.tech", "mbbs", "llb", "bca", "bba", "polytechnic", "diploma"]
    for course in courses:
        if course in query_lower:
            extracted["course"] = course.upper()
            break
            
    return extracted

async def process_student_query(query: str) -> Dict[str, Any]:
    """
    Processes queries through the hybrid AI architecture.
    """
    intent = detect_intent(query)
    
    # Guardrail trigger
    if intent == "unrelated":
        return {
            "intent": "unrelated",
            "message": "I can only assist with college admission related queries.",
            "structured_data": None
        }
        
    entities = extract_entities(query)
    
    # Search every college from MongoDB
    colleges_col = get_collection("colleges")
    
    db_college = None
    
    # 1. Search using extracted college name if found
    if entities.get("college"):
        db_college = await colleges_col.find_one(
            {
                "College Name": {
                    "$regex": re.escape(entities["college"]),
                    "$options": "i"
                }
            }
        )
        
    # 2. Fallback to direct partial match of query in College Name
    if not db_college:
        db_college = await colleges_col.find_one(
            {
                "College Name": {
                    "$regex": re.escape(query),
                    "$options": "i"
                }
            }
        )
        
    # 3. Fallback to sub-tokens of query to find matches
    if not db_college and len(query) > 3:
        words = [w for w in re.split(r'\W+', query) if len(w) > 3 and w.lower() not in ["about", "tell", "show", "info", "fees", "what", "where", "list", "college"]]
        for word in words:
            db_college = await colleges_col.find_one(
                {
                    "College Name": {
                        "$regex": re.escape(word),
                        "$options": "i"
                    }
                }
            )
            if db_college:
                break
                
        if db_college:
            response_data = {
                "name": db_college.get("College Name", "Unknown College"),
                "college_type": db_college.get("Type", "Not Available"),
                "state": "Maharashtra",
                "city": db_college.get("District", "Not Available"),
                "description": db_college.get("Address", "No description available."),

                "courses": [
                    "Engineering"
                ],

                "admission_process": "Admissions are conducted according to AICTE / State CET counselling process.",

                "eligibility": "Candidate should satisfy the eligibility criteria prescribed by the admission authority.",

                "required_documents": [
                    "10th Marksheet",
                    "12th Marksheet",
                    "Entrance Score Card",
                    "Transfer Certificate",
                    "Category Certificate (if applicable)"
                ],

                "approximate_fees": 100000,

                "official_website": "https://www.aicte-india.org",

                "contact_information": db_college.get("Address", "Not Available"),

                "_id": str(db_college["_id"])
        }

        return {
            "intent": "college_info",
            "message": f"I found information about {response_data['name']}.",
            "structured_data": response_data
        }

    # Fallback to Gemini AI
    prompt = (
        "You are CampusAI, India's premier AI Admission Assistant. "
        "The student is asking: '{query}'\n"
        "Provide a concise, professional answer. "
        "If they are comparing colleges, summarize key differences clearly. "
        "Keep the response under 150 words. Focus strictly on admissions, courses, or eligibility. "
        "Use bullet points for readability where appropriate."
    ).format(query=query)
    
    ai_response = await generate_gemini_content(prompt)
    
    # Cache the AI response in MongoDB log for analytics/caching in Phase 3
    try:
        logs_col = get_collection("cached_ai_responses")
        await logs_col.insert_one({
            "query": query,
            "response": ai_response,
            "intent": intent,
            "entities": entities
        })
    except Exception:
        pass  # Fail silently if logging/caching collection write fails

    return {
        "intent": intent,
        "message": ai_response,
        "structured_data": None
    }
