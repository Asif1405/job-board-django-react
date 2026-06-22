// ─── User / Auth ──────────────────────────────────────────────────────────────

export type UserRole = "employer" | "candidate" | "admin";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  date_joined: string;
  employer_profile?: EmployerProfile;
  candidate_profile?: CandidateProfile;
}

export interface EmployerProfile {
  id: string;
  company_name: string;
  company_website?: string;
  company_description?: string;
  company_size?: string;
  industry?: string;
  logo?: string;
}

export interface CandidateProfile {
  id: string;
  headline?: string;
  bio?: string;
  resume?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  skills: string[];
  years_of_experience?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export type JobType = "full_time" | "part_time" | "contract" | "internship" | "remote";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";
export type JobStatus = "draft" | "active" | "closed" | "expired";

export interface Category {
  id: string;
  name: string;
  slug: string;
  job_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  company_logo?: string;
  location: string;
  is_remote: boolean;
  job_type: JobType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements: string;
  benefits?: string;
  category: Category;
  tags: Tag[];
  status: JobStatus;
  applications_count: number;
  posted_by: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  has_applied?: boolean;
}

export interface JobFilters {
  search?: string;
  category?: string;
  job_type?: JobType;
  experience_level?: ExperienceLevel;
  location?: string;
  is_remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  ordering?: string;
  page?: number;
}

export interface JobWritePayload {
  title: string;
  location: string;
  is_remote: boolean;
  job_type: JobType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements: string;
  benefits?: string;
  category: string;
  tags?: string[];
  status?: JobStatus;
  expires_at?: string;
}

// ─── Applications ─────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "submitted"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "offered"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  job: Job;
  applicant: User;
  status: ApplicationStatus;
  cover_letter?: string;
  resume?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreatePayload {
  job: string;
  cover_letter?: string;
  resume?: string;
}

export interface ApplicationStatusUpdate {
  status: ApplicationStatus;
  notes?: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── API errors ───────────────────────────────────────────────────────────────

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}
