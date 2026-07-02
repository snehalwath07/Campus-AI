export interface UserPreferences {
  preferred_state: string;
  preferred_city: string;
  preferred_course: string;
  category: string;
  budget: number;
  marks_12: number;
  entrance_score: number;
  preferred_college_type: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  preferences: UserPreferences;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiErrorResponse {
  detail: string | { msg: string; type: string; loc: string[] }[];
}

export interface College {
  _id?: string;
  id?: string;
  name: string;
  college_type: string;
  state: string;
  city: string;
  description: string;
  courses: string[];
  admission_process: string;
  eligibility: string;
  required_documents: string[];
  approximate_fees: number;
  official_website: string;
  contact_information: string;
  last_updated?: string;
}

export interface SavedCollege {
  id: string;
  user_id: string;
  college_id: string;
  saved_at: string;
  college_details?: College;
}

export interface ChatMessage {
  sender: 'student' | 'ai';
  message: string;
  timestamp: string;
  structured_data?: College | null;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  messages: ChatMessage[];
}

export interface RoadmapStep {
  step: number;
  title: string;
  details: string;
  status: 'active' | 'pending' | 'completed';
}

export interface AdmissionRoadmap {
  id?: string;
  user_id: string;
  preferred_course: string;
  preferred_state: string;
  preferred_city: string;
  roadmap: RoadmapStep[];
  created_at: string;
}
