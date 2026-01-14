// User roles
export type UserRole = 'Intern' | 'Telecaller' | 'BD' | 'Sales' | 'Admin';

export interface User {
  user_id: number;
  full_name: string;
  role: UserRole;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  created_date: string;
}

// Master table types
export interface IndustryMaster {
  industry_id: number;
  industry_name: string;
}

export interface LeadSourceMaster {
  source_id: number;
  source_name: string;
}

export interface CityMaster {
  city_id: number;
  city_name: string;
}

export interface CountryMaster {
  country_id: number;
  country_name: string;
}

export interface IndustryLOB {
  lob_id: number;
  lob_name: string;
  industry_name: string;
}

export interface DepartmentMaster {
  id: number;
  name: string;
}

export interface UseCaseMaster {
  id: number;
  name: string;
  lob_id: number;
}

export interface ProductMaster {
  id: number;
  name: string;
}

// Account types
export type AccountStatus = 'Prospect' | 'Active' | 'Dormant';

export interface Account {
  account_id: number;
  account_name: string;
  industry: string;
  head_office: string;
  hq_city?: string;
  company_website: string;
  primary_contact_name: string;
  contact_person_role: string;
  contact_phone: string;
  contact_email: string;
  company_phone: string;
  total_meetings_conducted: number;
  total_pocs: number;
  total_revenue: number;
  account_status: AccountStatus;
  account_owner: number;
  lead_source: string;
  remarks: string;
  created_date: string;
  last_updated: string;
  primary_lob?: string;
  data_completion_score?: number;
  lead_id?: number;
  stage_id?: number;
  stage_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  employee_count?: number;
  country?: string;
}

// Lead types
export type LeadSource = string;

export interface LeadStage {
  stage_id: number;
  stage_name: string;
}

export interface LeadStageStatus {
  status_id: number;
  status_name: string;
  stage_id: number;
}

export interface TelecallLog {
  call_id: number;
  lead_id: number;
  account_id: number;
  telecaller_user_id: number;
  telecaller_name?: string;
  call_datetime: string;
  call_duration_seconds?: number;
  call_outcome: string;
  notes?: string;
  followup_required: boolean;
  followup_datetime?: string;
  created_at: string;
}

export interface Lead {
  lead_id: number;
  account_id: number;
  lead_date: string;
  lead_source: LeadSource;
  lead_generated_by: number;
  assigned_telecaller: number | null;
  bd_assigned_to: number | null;
  stage_id: number;
  status_id: number;
  last_contacted_at: string | null;
  next_followup_at: string | null;
  expected_value: number;
  products_interested: string;
  product_mapped: string;
  remarks: string;
  call_status?: string;
  created_date: string;
  updated_date: string;
}

// Extended lead with joined data
export interface LeadWithDetails extends Lead {
  account_name: string;
  stage_name: string;
  status_name: string;
  generated_by_name: string;
  telecaller_name: string | null;
  bd_name: string | null;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth context type
export interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  hasPermission: (action: string, resource: string) => boolean;
  login: (credentials: any) => Promise<boolean>;
  logout: () => void;
}

export interface LeadListItem {
  lead_id: number;
  account_id: number;
  lead_date: string;
  account_name: string;
  generated_by: string;
  de_assigned_to_name?: string;
  de_assigned_to?: number;
  lead_source: string;
  stage_name: string;
  stage_id: number;
  status_name: string;
  status_id: number;
  industry?: string;
  primary_lob?: string;
  hq_city?: string;
  data_completion_score?: number;
  expected_value?: number;
  next_followup_at?: string | null;
  product_mapped?: string;
  contact_phone?: string;
  last_call_outcome?: string;
  call_status?: string;
}

// Account Details - Related Entities
export interface AccountContact {
  id: number;
  account_id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface AccountLineOfBusiness {
  id: number;
  account_id: number;
  business_type: string;
  description: string;
}

export interface AccountDepartment {
  id: number;
  account_id: number;
  department_name: string;
  head_name: string;
}

export interface AccountUseCase {
  id: number;
  account_id: number;
  use_case_title: string;
  description: string;
  status: 'Identified' | 'In Progress' | 'Implemented' | 'On Hold';
}

export interface DepartmentPainPoint {
  id: number;
  department_id: number;
  department_name?: string;
  pain_point: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  notes: string;
}

export interface AccountFull extends Account {
  contacts: AccountContact[];
  lineOfBusiness: AccountLineOfBusiness[];
  departments: AccountDepartment[];
  useCases: AccountUseCase[];
  painPoints: DepartmentPainPoint[];
}

export interface AccountMeeting {
  meeting_id: number;
  lead_id: number;
  account_id: number;
  meeting_type: string;
  meeting_mode: 'Online' | 'In-Person';
  meeting_date: string;
  meeting_time: string;
  meeting_city?: number;
  city_name?: string;
  meeting_address?: string;
  internal_attendees?: string;
  customer_attendees?: string;
  meeting_notes?: string;
  meeting_status: 'Scheduled' | 'Completed' | 'Cancelled';
  created_at: string;
}

