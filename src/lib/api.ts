// Use environment variable for API base URL
// In production (with Nginx), this will be '/api' (proxied to backend)
// In development, this will be 'http://localhost:3001/api'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface Lead {
    account_id: number;
    lead_date: string;
    lead_source: string;
    lead_generated_by: number;
    assigned_telecaller: number;
    bd_assigned_to: number;
    stage_id: number;
    status_id: number;
    last_call_date?: string;
    next_followup_date?: string;
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
    }
};
