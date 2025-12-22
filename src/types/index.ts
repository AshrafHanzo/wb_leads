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

// Account types
export type AccountStatus = 'Prospect' | 'Active' | 'Dormant';

export interface Account {
  account_id: number;
  account_name: string;
  industry: string;
  head_office: string;
  location: string;
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
  last_call_date: string | null;
  next_followup_date: string | null;
  expected_value: number;
  products_interested: string;
  product_mapped: string;
  remarks: string;
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
}
