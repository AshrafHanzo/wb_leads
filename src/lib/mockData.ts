import { User, Account, Lead, LeadStage, LeadStageStatus, LeadWithDetails } from '@/types';

export const mockUsers: User[] = [
  { user_id: 1, full_name: 'Admin User', role: 'Admin', email: 'admin@workbooster.com', phone: '+1234567890', status: 'Active', created_date: '2024-01-01T00:00:00Z' },
  { user_id: 2, full_name: 'Sarah Johnson', role: 'BD', email: 'sarah@workbooster.com', phone: '+1234567891', status: 'Active', created_date: '2024-02-15T00:00:00Z' },
  { user_id: 3, full_name: 'Mike Chen', role: 'Telecaller', email: 'mike@workbooster.com', phone: '+1234567892', status: 'Active', created_date: '2024-03-01T00:00:00Z' },
  { user_id: 4, full_name: 'Emily Davis', role: 'Sales', email: 'emily@workbooster.com', phone: '+1234567893', status: 'Active', created_date: '2024-03-15T00:00:00Z' },
  { user_id: 5, full_name: 'Alex Kim', role: 'Intern', email: 'alex@workbooster.com', phone: '+1234567894', status: 'Active', created_date: '2024-04-01T00:00:00Z' },
  { user_id: 6, full_name: 'Jessica Brown', role: 'Telecaller', email: 'jessica@workbooster.com', phone: '+1234567895', status: 'Active', created_date: '2024-04-15T00:00:00Z' },
  { user_id: 7, full_name: 'David Wilson', role: 'BD', email: 'david@workbooster.com', phone: '+1234567896', status: 'Inactive', created_date: '2024-05-01T00:00:00Z' },
];

export const mockAccounts: Account[] = [
  { account_id: 1, account_name: 'TechCorp Solutions', industry: 'Technology', head_office: 'San Francisco', location: 'San Francisco, CA', primary_contact_name: 'John Smith', contact_person_role: 'CTO', contact_phone: '+1555123456', contact_email: 'john@techcorp.com', company_phone: '+1555123000', total_meetings_conducted: 5, total_pocs: 2, total_revenue: 75000, account_status: 'Active', account_owner: 2, lead_source: 'LinkedIn', remarks: 'Key enterprise client', created_date: '2024-01-15T00:00:00Z', last_updated: '2024-12-10T00:00:00Z' },
  { account_id: 2, account_name: 'Global Finance Inc', industry: 'Finance', head_office: 'New York', location: 'New York, NY', primary_contact_name: 'Lisa Wang', contact_person_role: 'CFO', contact_phone: '+1555234567', contact_email: 'lisa@globalfinance.com', company_phone: '+1555234000', total_meetings_conducted: 8, total_pocs: 3, total_revenue: 120000, account_status: 'Active', account_owner: 2, lead_source: 'Referral', remarks: 'Long-term partnership', created_date: '2024-02-01T00:00:00Z', last_updated: '2024-12-12T00:00:00Z' },
  { account_id: 3, account_name: 'HealthFirst Medical', industry: 'Healthcare', head_office: 'Boston', location: 'Boston, MA', primary_contact_name: 'Dr. Robert Chen', contact_person_role: 'Director', contact_phone: '+1555345678', contact_email: 'robert@healthfirst.com', company_phone: '+1555345000', total_meetings_conducted: 3, total_pocs: 1, total_revenue: 45000, account_status: 'Prospect', account_owner: 4, lead_source: 'Website', remarks: 'Interested in enterprise plan', created_date: '2024-06-15T00:00:00Z', last_updated: '2024-12-08T00:00:00Z' },
  { account_id: 4, account_name: 'RetailMax Corp', industry: 'Retail', head_office: 'Chicago', location: 'Chicago, IL', primary_contact_name: 'Amanda Foster', contact_person_role: 'VP Operations', contact_phone: '+1555456789', contact_email: 'amanda@retailmax.com', company_phone: '+1555456000', total_meetings_conducted: 2, total_pocs: 0, total_revenue: 0, account_status: 'Dormant', account_owner: 2, lead_source: 'Employee', remarks: 'Paused discussions', created_date: '2024-03-01T00:00:00Z', last_updated: '2024-09-15T00:00:00Z' },
  { account_id: 5, account_name: 'EduLearn Systems', industry: 'Education', head_office: 'Austin', location: 'Austin, TX', primary_contact_name: 'Mark Thompson', contact_person_role: 'CEO', contact_phone: '+1555567890', contact_email: 'mark@edulearn.com', company_phone: '+1555567000', total_meetings_conducted: 4, total_pocs: 2, total_revenue: 55000, account_status: 'Active', account_owner: 4, lead_source: 'LinkedIn', remarks: 'Expanding to new markets', created_date: '2024-07-01T00:00:00Z', last_updated: '2024-12-14T00:00:00Z' },
];

export const mockLeadStages: LeadStage[] = [
  { stage_id: 1, stage_name: 'New Lead' },
  { stage_id: 2, stage_name: 'Contacted' },
  { stage_id: 3, stage_name: 'Qualified' },
  { stage_id: 4, stage_name: 'Proposal' },
  { stage_id: 5, stage_name: 'Negotiation' },
  { stage_id: 6, stage_name: 'Closed Won' },
  { stage_id: 7, stage_name: 'Closed Lost' },
];

export const mockLeadStatuses: LeadStageStatus[] = [
  { status_id: 1, status_name: 'Pending Contact', stage_id: 1 },
  { status_id: 2, status_name: 'No Response', stage_id: 2 },
  { status_id: 3, status_name: 'Call Scheduled', stage_id: 2 },
  { status_id: 4, status_name: 'Meeting Booked', stage_id: 3 },
  { status_id: 5, status_name: 'Requirements Gathered', stage_id: 3 },
  { status_id: 6, status_name: 'Proposal Sent', stage_id: 4 },
  { status_id: 7, status_name: 'Proposal Reviewed', stage_id: 4 },
  { status_id: 8, status_name: 'Price Discussion', stage_id: 5 },
  { status_id: 9, status_name: 'Contract Review', stage_id: 5 },
  { status_id: 10, status_name: 'Deal Won', stage_id: 6 },
  { status_id: 11, status_name: 'Deal Lost', stage_id: 7 },
  { status_id: 12, status_name: 'Not Interested', stage_id: 7 },
];

export const mockLeads: Lead[] = [
  { lead_id: 1, account_id: 1, lead_date: '2024-12-01T10:00:00Z', lead_source: 'LinkedIn', lead_generated_by: 5, assigned_telecaller: 3, bd_assigned_to: 2, stage_id: 4, status_id: 6, last_call_date: '2024-12-14T00:00:00Z', next_followup_date: '2024-12-18T00:00:00Z', expected_value: 25000, products_interested: 'Enterprise Suite, Analytics', product_mapped: 'Enterprise Suite', remarks: 'Very interested in analytics features', created_date: '2024-12-01T10:00:00Z', updated_date: '2024-12-14T00:00:00Z' },
  { lead_id: 2, account_id: 2, lead_date: '2024-11-15T09:00:00Z', lead_source: 'Referral', lead_generated_by: 4, assigned_telecaller: 6, bd_assigned_to: 2, stage_id: 5, status_id: 8, last_call_date: '2024-12-12T00:00:00Z', next_followup_date: '2024-12-16T00:00:00Z', expected_value: 50000, products_interested: 'Full Platform', product_mapped: 'Full Platform', remarks: 'Negotiating annual contract', created_date: '2024-11-15T09:00:00Z', updated_date: '2024-12-12T00:00:00Z' },
  { lead_id: 3, account_id: 3, lead_date: '2024-12-10T14:00:00Z', lead_source: 'Website', lead_generated_by: 5, assigned_telecaller: 3, bd_assigned_to: null, stage_id: 2, status_id: 3, last_call_date: '2024-12-15T00:00:00Z', next_followup_date: '2024-12-17T00:00:00Z', expected_value: 15000, products_interested: 'Basic Plan', product_mapped: '', remarks: 'Initial call completed', created_date: '2024-12-10T14:00:00Z', updated_date: '2024-12-15T00:00:00Z' },
  { lead_id: 4, account_id: 5, lead_date: '2024-12-05T11:00:00Z', lead_source: 'LinkedIn', lead_generated_by: 2, assigned_telecaller: 6, bd_assigned_to: 2, stage_id: 3, status_id: 5, last_call_date: '2024-12-13T00:00:00Z', next_followup_date: '2024-12-19T00:00:00Z', expected_value: 30000, products_interested: 'Education Module', product_mapped: 'Education Module', remarks: 'Demo scheduled for next week', created_date: '2024-12-05T11:00:00Z', updated_date: '2024-12-13T00:00:00Z' },
  { lead_id: 5, account_id: 1, lead_date: '2024-12-12T08:00:00Z', lead_source: 'Employee', lead_generated_by: 4, assigned_telecaller: 3, bd_assigned_to: null, stage_id: 1, status_id: 1, last_call_date: null, next_followup_date: '2024-12-16T00:00:00Z', expected_value: 10000, products_interested: 'Add-on Services', product_mapped: '', remarks: 'Cross-sell opportunity', created_date: '2024-12-12T08:00:00Z', updated_date: '2024-12-12T00:00:00Z' },
  { lead_id: 6, account_id: 4, lead_date: '2024-10-01T10:00:00Z', lead_source: 'Website', lead_generated_by: 5, assigned_telecaller: 6, bd_assigned_to: 2, stage_id: 7, status_id: 12, last_call_date: '2024-10-15T00:00:00Z', next_followup_date: null, expected_value: 0, products_interested: 'Retail Solution', product_mapped: '', remarks: 'Budget constraints', created_date: '2024-10-01T10:00:00Z', updated_date: '2024-10-15T00:00:00Z' },
];

// Helper to get lead with details
export function getLeadWithDetails(lead: Lead): LeadWithDetails {
  const account = mockAccounts.find(a => a.account_id === lead.account_id);
  const stage = mockLeadStages.find(s => s.stage_id === lead.stage_id);
  const status = mockLeadStatuses.find(s => s.status_id === lead.status_id);
  const generatedBy = mockUsers.find(u => u.user_id === lead.lead_generated_by);
  const telecaller = lead.assigned_telecaller ? mockUsers.find(u => u.user_id === lead.assigned_telecaller) : null;
  const bd = lead.bd_assigned_to ? mockUsers.find(u => u.user_id === lead.bd_assigned_to) : null;

  return {
    ...lead,
    account_name: account?.account_name || 'Unknown',
    stage_name: stage?.stage_name || 'Unknown',
    status_name: status?.status_name || 'Unknown',
    generated_by_name: generatedBy?.full_name || 'Unknown',
    telecaller_name: telecaller?.full_name || null,
    bd_name: bd?.full_name || null,
  };
}
