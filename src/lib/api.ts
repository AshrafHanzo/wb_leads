// Use environment variable for API base URL
// In production (with Nginx), this will be '/api' (proxied to backend)
// In development, this will be 'http://localhost:3001/api'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

import { TelecallLog } from '../types';

export interface Lead {
    lead_id?: number;
    account_id: number;
    lead_date: string;
    lead_source: string;
    lead_generated_by: number;
    assigned_telecaller: number;
    bd_assigned_to: number;
    stage_id: number;
    status_id: number;
    last_contacted_at?: string;
    next_followup_at?: string;
    expected_value: number;
    products_interested: string;
    product_mapped: string;
    remarks: string;
}

export interface Account {
    account_id: number;
    account_name: string;
}

export interface User {
    user_id: number;
    full_name: string;
    role?: string;
}

export interface Stage {
    stage_id: number;
    stage_name: string;
}

export interface Status {
    status_id: number;
    status_name: string;
}

export interface Industry {
    industry_id: number;
    industry_name: string;
}

export interface LeadSource {
    source_id: number;
    source_name: string;
}

export const api = {
    // Get dropdown data
    async getAccounts(): Promise<Account[]> {
        const response = await fetch(`${API_BASE_URL}/leads/accounts`);
        if (!response.ok) throw new Error('Failed to fetch accounts');
        return response.json();
    },

    async getAllAccounts(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/accounts`);
        if (!response.ok) throw new Error('Failed to fetch all accounts');
        return response.json();
    },

    async createAccount(account: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(account),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create account');
        }
        return response.json();
    },

    async updateAccount(id: number, account: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(account),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update account');
        }
        return response.json();
    },

    async deleteAccount(id: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete account');
        }
        return response.json();
    },

    async getUsers(): Promise<User[]> {
        const response = await fetch(`${API_BASE_URL}/leads/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    async getStages(): Promise<Stage[]> {
        const response = await fetch(`${API_BASE_URL}/leads/stages`);
        if (!response.ok) throw new Error('Failed to fetch stages');
        return response.json();
    },

    async getStatuses(): Promise<Status[]> {
        const response = await fetch(`${API_BASE_URL}/leads/statuses`);
        if (!response.ok) throw new Error('Failed to fetch statuses');
        return response.json();
    },

    async getIndustries(): Promise<Industry[]> {
        const response = await fetch(`${API_BASE_URL}/leads/industries`);
        if (!response.ok) throw new Error('Failed to fetch industries');
        return response.json();
    },

    async getLeadSources(): Promise<LeadSource[]> {
        const response = await fetch(`${API_BASE_URL}/leads/lead-sources`);
        if (!response.ok) throw new Error('Failed to fetch lead sources');
        return response.json();
    },

    async getCities(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/leads/cities`);
        if (!response.ok) throw new Error('Failed to fetch cities');
        return response.json();
    },

    async getCountries(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/leads/countries`);
        if (!response.ok) throw new Error('Failed to fetch countries');
        return response.json();
    },

    async getIndustryLOBs(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/leads/industry-lobs`);
        if (!response.ok) throw new Error('Failed to fetch industry LOBs');
        return response.json();
    },

    async getDepartmentsMaster(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/leads/departments-master`);
        if (!response.ok) throw new Error('Failed to fetch departments master');
        return response.json();
    },

    async getUseCasesMaster(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/leads/use-cases-master`);
        if (!response.ok) throw new Error('Failed to fetch use cases master');
        return response.json();
    },

    async getProductsMaster(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/leads/products-master`);
        if (!response.ok) throw new Error('Failed to fetch products master');
        return response.json();
    },

    async getLeads(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/leads`);
        if (!response.ok) throw new Error('Failed to fetch leads');
        return response.json();
    },

    async getLead(id: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/leads/${id}`);
        if (!response.ok) throw new Error('Failed to fetch lead');
        return response.json();
    },

    async getDashboardStats(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return response.json();
    },

    async getUserLeadStats(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/dashboard/user-stats`);
        if (!response.ok) throw new Error('Failed to fetch user lead stats');
        return response.json();
    },

    // Create lead
    async createLead(lead: Lead): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(lead),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details ? `${error.error}: ${error.details}` : (error.error || 'Failed to create lead'));
        }

        return response.json();
    },

    async updateLead(id: number, leadData: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details ? `${error.error}: ${error.details}` : (error.error || 'Failed to update lead'));
        }
        return response.json();
    },

    async updateLeadStage(id: number, stageData: { stage_id: number; status_id?: number }): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/leads/${id}/stage`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(stageData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details ? `${error.error}: ${error.details}` : (error.error || 'Failed to update lead stage'));
        }
        return response.json();
    },

    async updateLeadDE(id: number, deAssignedTo: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/leads/${id}/de-assignment`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ de_assigned_to: deAssignedTo }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update DE assignment');
        }
        return response.json();
    },

    // Auth
    login: async (credentials: any) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        return response.json();
    },

    // User Management
    createUser: async (userData: any) => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    updateUser: async (id: number, userData: any) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    deleteUser: async (id: number) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
        });
        return response.json();
    },
    async deleteLead(id: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details ? `${error.error}: ${error.details}` : (error.error || 'Failed to delete lead'));
        }
        return response.json();
    },

    // =====================================================
    // ACCOUNT DETAILS API METHODS
    // =====================================================

    async getAccountFull(id: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${id}/full`);
        if (!response.ok) throw new Error('Failed to fetch account details');
        return response.json();
    },

    // Account Contacts
    async getAccountContacts(accountId: number): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/contacts`);
        if (!response.ok) throw new Error('Failed to fetch contacts');
        return response.json();
    },

    async createAccountContact(accountId: number, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create contact');
        return response.json();
    },

    async updateAccountContact(accountId: number, contactId: number, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/contacts/${contactId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update contact');
        return response.json();
    },

    async deleteAccountContact(accountId: number, contactId: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/contacts/${contactId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete contact');
        return response.json();
    },

    // Account Line of Business
    async getAccountLineOfBusiness(accountId: number): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/line-of-business`);
        if (!response.ok) throw new Error('Failed to fetch line of business');
        return response.json();
    },

    async createAccountLineOfBusiness(accountId: number, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/line-of-business`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create line of business');
        return response.json();
    },

    async updateAccountLineOfBusiness(accountId: number, lobId: number, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/line-of-business/${lobId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update line of business');
        return response.json();
    },

    async deleteAccountLineOfBusiness(accountId: number, lobId: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/line-of-business/${lobId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete line of business');
        return response.json();
    },

    // Account Departments
    async getAccountDepartments(accountId: number): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/departments`);
        if (!response.ok) throw new Error('Failed to fetch departments');
        return response.json();
    },

    async createAccountDepartment(accountId: number, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/departments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create department');
        return response.json();
    },

    async updateAccountDepartment(accountId: number, deptId: number, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/departments/${deptId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update department');
        return response.json();
    },

    async deleteAccountDepartment(accountId: number, deptId: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/departments/${deptId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete department');
        return response.json();
    },

    // Account Use Cases
    async getAccountUseCases(accountId: number): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/use-cases`);
        if (!response.ok) throw new Error('Failed to fetch use cases');
        return response.json();
    },

    async createAccountUseCase(accountId: number, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/use-cases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create use case');
        return response.json();
    },

    async updateAccountUseCase(accountId: number, ucId: number, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/use-cases/${ucId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update use case');
        return response.json();
    },

    async deleteAccountUseCase(accountId: number, ucId: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/use-cases/${ucId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete use case');
        return response.json();
    },

    // Department Pain Points
    async getDepartmentPainPoints(deptId: number): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/departments/${deptId}/pain-points`);
        if (!response.ok) throw new Error('Failed to fetch pain points');
        return response.json();
    },

    async createDepartmentPainPoint(deptId: number, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/departments/${deptId}/pain-points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create pain point');
        return response.json();
    },

    async updateDepartmentPainPoint(deptId: number, ppId: number, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/departments/${deptId}/pain-points/${ppId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update pain point');
        return response.json();
    },

    async deleteDepartmentPainPoint(deptId: number, ppId: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/departments/${deptId}/pain-points/${ppId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete pain point');
        return response.json();
    },

    // Telecall Logs
    async logCall(data: Partial<TelecallLog>): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/calls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to log call');
        }
        return response.json();
    },

    async getLeadCalls(leadId: number): Promise<TelecallLog[]> {
        const response = await fetch(`${API_BASE_URL}/leads/${leadId}/calls`);
        if (!response.ok) throw new Error('Failed to fetch lead call history');
        return response.json();
    },

    async getAccountTelecallLogs(accountId: number): Promise<TelecallLog[]> {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/call-logs`);
        if (!response.ok) throw new Error('Failed to fetch account call logs');
        return response.json();
    },

    // Account Meetings
    async createMeeting(meeting: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/meetings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meeting),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create meeting');
        }
        return response.json();
    },

    async getLeadMeetings(leadId: number): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/leads/${leadId}/meetings`);
        if (!response.ok) throw new Error('Failed to fetch lead meetings');
        return response.json();
    },

    async getAllMeetings(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/meetings`);
        if (!response.ok) throw new Error('Failed to fetch all meetings');
        return response.json();
    },

    async updateMeetingStatus(meetingId: number, status: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update meeting status');
        return response.json();
    },

    // Generic Master Tables CRUD
    async fetchMasterTable(table: string): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/master/${table}`);
        if (!response.ok) throw new Error(`Failed to fetch ${table}`);
        return response.json();
    },

    async addMasterRecord(table: string, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/master/${table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Failed to add record to ${table}`);
        return response.json();
    },

    async updateMasterRecord(table: string, id: number | string, data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/master/${table}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Failed to update record in ${table}`);
        return response.json();
    },

    async deleteMasterRecord(table: string, id: number | string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/master/${table}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Failed to delete record from ${table}`);
        return response.json();
    },

    async getLeadStats(stageIds?: number[]): Promise<{
        today: number,
        yesterday: number,
        thisWeek: number,
        thisMonth: number,
        callsToday?: number,
        outcomes?: {
            noAnswer: number,
            busy: number,
            callback: number,
            interested: number,
            notInterested: number
        }
    }> {
        const queryParams = stageIds && stageIds.length > 0 ? `?stage_ids=${stageIds.join(',')}` : '';
        const response = await fetch(`${API_BASE_URL}/leads/stats${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch lead stats');
        return response.json();
    },

    async getMeetingStats(): Promise<{ today: number, yesterday: number, thisWeek: number, thisMonth: number }> {
        const response = await fetch(`${API_BASE_URL}/meetings/stats`);
        if (!response.ok) throw new Error('Failed to fetch meeting stats');
        return response.json();
    },

    async rescheduleMeeting(id: number, date: string, time: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/meetings/${id}/reschedule`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meeting_date: date, meeting_time: time }),
        });
        if (!response.ok) throw new Error('Failed to reschedule meeting');
        return response.json();
    }
};
