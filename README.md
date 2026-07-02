# CampusAI - India's AI Admission Assistant

> One Platform. Every College. Every Course. Every Admission Answer.

CampusAI is a central education admission console designed to simplify college admissions across India.

This repository contains the complete production-ready **Phase 1, Phase 2, and Phase 3 codebase**, implementing a premium, dark-themed, purple-accented user experience with a fully integrated FastAPI backend, MongoDB data persistence, and a hybrid AI Counselor.

---

## Folder Structure

```text
CampusAI/
├── backend/
│   ├── app/
│   │   ├── auth/         # JWT credentials and authorization handler
│   │   ├── config/       # Environment configuration settings
│   │   ├── database/     # MongoDB driver setup
│   │   ├── models/       # Database schemas (Pydantic / MongoDB)
│   │   ├── routers/      # API Endpoints (/auth/*, /colleges/*, /saved-colleges/*, /chat/*, /planner/*, /profile/*)
│   │   ├── schemas/      # HTTP request and response structures
│   │   └── services/     # Hybrid AI Engine & Gemini API caller
│   ├── .env              # Secrets configuration
│   ├── .env.example      # Example environment variables
│   ├── main.py           # Dev server runner
│   ├── requirements.txt  # Python package list
│   ├── verify_auth.py    # Local integration verification test (Phase 1)
│   └── verify_phase3.py  # AI intent & roadmap verification test (Phase 3)
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Input, Button, PasswordStrength)
│   │   ├── context/      # Session and global Auth state management
│   │   ├── layouts/      # Split-pane responsive layouts
│   │   ├── pages/        # Views (Login, Signup, Recovery, Reset, Home, AiChat, AdmissionPlanner, CompareColleges, SavedColleges, Profile)
│   │   ├── services/     # Axios client and API mapping clients
│   │   ├── styles/       # Tailwind v4 configuration and custom CSS
│   │   └── types/        # TypeScript interfaces
│   ├── package.json      # NPM dependencies
│   ├── tsconfig.json     # TypeScript project config
│   └── vite.config.ts    # Bundler config
├── docker-compose.yml     # Container orchestration config
├── .gitignore            # Git exclusion mapping
├── LICENSE               # MIT License details
└── README.md             # Guide documentation
```

---

## Tech Stack

### Frontend
- **Framework:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion (micro-animations)
- **State & Server Async:** TanStack React Query, Axios
- **Form & Validation:** React Hook Form, Zod
- **Icons & Alerts:** Lucide React, Sonner (Toast alerts)

### Backend
- **Framework:** FastAPI, Python 3.11+
- **Database Driver:** Motor (Async MongoDB Driver) + dnspython
- **Security:** JWT (PyJWT), bcrypt (Password hashing)
- **Validation:** Pydantic V2, Pydantic Settings
- **HTTP Client:** Httpx (Queries Gemini REST API)

### Database
- **Engine:** MongoDB Atlas / Local MongoDB fallback

---

## Setup Instructions

### Environment Variables

Create a `.env` file in the `backend/` directory.

```ini
# backend/.env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusai?retryWrites=true&w=majority
DATABASE_NAME=campusai

# JWT Authentication Config
JWT_SECRET_KEY=generate-a-secure-32-byte-hexadecimal-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Gemini API Key (Optional: fallbacks to simulated reasoning if empty)
GEMINI_API_KEY=AIzaSyYourKeyHere
```

---

## Database Initialization & Seeding

On backend startup, the system automatically checks if the `colleges` collection is empty. If it is, the server auto-seeds **9 premium institutions** representing various streams:
- **IIT Delhi & IIT Bombay** (Engineering)
- **IIM Ahmedabad** (Management)
- **AIIMS New Delhi** (Medical)
- **NLSIU Bengaluru** (Law)
- **LSR College New Delhi** (Arts)
- **NID Ahmedabad** (Design)
- **Government Polytechnic Mumbai** (Diploma/Polytechnic)
- **BITS Pilani** (Engineering/Pharmacy/Science)

---

## API Specifications

| Method | Endpoint | Description | Guarded |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/signup` | Registers new student accounts | No |
| `POST` | `/auth/login` | Validates credentials and returns JWT token | No |
| `POST` | `/auth/logout` | Discards client sessions | No |
| `POST` | `/auth/forgot-password` | Generates reset URL and tokens | No |
| `POST` | `/auth/reset-password` | Updates passwords using valid reset tokens | No |
| `GET` | `/auth/me` | Fetches active student profile from active token | **Yes** |
| `GET` | `/colleges` | Queries, searches, and filters colleges | **Yes** |
| `GET` | `/colleges/{id}` | Fetches detailed parameters for a college | **Yes** |
| `POST` | `/colleges/seed` | Triggers database seeding manually | **Yes** |
| `GET` | `/saved-colleges` | Fetches saved bookmarks | **Yes** |
| `POST` | `/saved-colleges` | Bookmarks a college to saved list | **Yes** |
| `DELETE` | `/saved-colleges/{id}` | Unbookmarks a college from list | **Yes** |
| `GET` | `/chat/sessions` | Fetches chat session histories | **Yes** |
| `GET` | `/chat/sessions/{id}` | Fetches message list for a session | **Yes** |
| `POST` | `/chat/query` | Submits admission queries (triggers AI engine) | **Yes** |
| `DELETE` | `/chat/sessions/{id}` | Deletes a conversation thread | **Yes** |
| `POST` | `/planner/generate` | Builds dynamic step-by-step roadmap | **Yes** |
| `GET` | `/planner/saved` | Restores saved roadmap blueprints | **Yes** |
| `POST` | `/planner/save` | Persists roadmap blueprint in database | **Yes** |
| `GET` | `/profile` | Fetches student profile parameters | **Yes** |
| `PUT` | `/profile` | Updates student credentials, marks, budget | **Yes** |

---

## Running Locally

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Initialize virtual environment & install packages:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run verification test suite:
   ```bash
   python verify_phase3.py
   ```
4. Start dev server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies & build:
   ```bash
   npm install
   npm run build
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   ```

---

## Docker Container Deployment

Start the entire stack (MongoDB, FastAPI backend API, Nginx frontend) using Docker Compose:

```bash
# Build and run containers
docker-compose up --build -d

# Verify logs
docker-compose logs -f
```

The services will be hosted at:
- **Frontend App:** `http://localhost`
- **Backend API:** `http://localhost:8000`
- **Swagger Docs:** `http://localhost:8000/docs`
