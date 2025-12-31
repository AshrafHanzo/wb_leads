const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

// Test database connection and run migrations
pool.query('SELECT NOW()', async (err, res) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Database connected successfully');

        // Fix: Drop legacy check constraint that conflicts with dynamic master table
        try {
            await pool.query('ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_lead_source_check');
            console.log('Fixed: Dropped leads_lead_source_check constraint');
        } catch (e) {
            console.log('Note: Constraint might not exist or could not be dropped', e.message);
        }

        // Seed/Reset Admin User
        try {
            const adminEmail = 'jananimohan44@gmail.com';
            const adminPass = 'janani04';
            // Check if exists
            const userCheck = await pool.query('SELECT user_id FROM users WHERE email = $1', [adminEmail]);
            if (userCheck.rows.length > 0) {
                // Update password
                await pool.query('UPDATE users SET password = $1 WHERE email = $2', [adminPass, adminEmail]);
                console.log('Admin password reset successfully');
            } else {
                // Create user
                await pool.query(
                    "INSERT INTO users (full_name, email, password, role, status) VALUES ($1, $2, $3, 'Admin', 'Active')",
                    ['Janani Mohan', adminEmail, adminPass]
                );
                console.log('Admin user created successfully');
            }
        } catch (e) {
            console.error('Error seeding admin user:', e.message);
        }

        // Add follow_up_status columns to leads table (for n8n import)
        try {
            await pool.query(`
                ALTER TABLE leads 
                ADD COLUMN IF NOT EXISTS follow_up_status_1 TEXT,
                ADD COLUMN IF NOT EXISTS follow_up_status_2 TEXT,
                ADD COLUMN IF NOT EXISTS call_status TEXT
            `);
            console.log('Added follow_up_status columns to leads table');
        } catch (e) {
            console.log('Note: follow_up_status columns might already exist', e.message);
        }

        // Add company_website to accounts table
        try {
            await pool.query(`
                ALTER TABLE accounts 
                ADD COLUMN IF NOT EXISTS company_website TEXT
            `);
            console.log('Added company_website column to accounts table');
        } catch (e) {
            console.log('Note: company_website column might already exist', e.message);
        }
    }
});

// API Routes

// Health Check
app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'healthy', timestamp: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ status: 'unhealthy', error: err.message });
    }
});

// Get Industries
app.get('/api/leads/industries', async (req, res) => {
    try {
        const result = await pool.query('SELECT industry_id, industry_name FROM industry_master ORDER BY industry_name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching industries:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Lead Sources
app.get('/api/leads/lead-sources', async (req, res) => {
    try {
        const result = await pool.query('SELECT lead_source_id as source_id, lead_source_name as source_name FROM lead_source_master ORDER BY lead_source_name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching lead sources:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Cities
app.get('/api/leads/cities', async (req, res) => {
    try {
        const result = await pool.query('SELECT city_id, city_name FROM city_master ORDER BY city_name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching cities:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Countries
app.get('/api/leads/countries', async (req, res) => {
    try {
        const result = await pool.query('SELECT country_id, country_name FROM country_master ORDER BY country_name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching countries:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Industry LOBs
app.get('/api/leads/departments-master', async (req, res) => {
    try {
        const query = 'SELECT department_master_id as id, department_name as name FROM department_master ORDER BY department_name';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching department master:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/leads/products-master', async (req, res) => {
    try {
        const query = 'SELECT product_id as id, product_name as name FROM product_master WHERE is_active = true ORDER BY product_name';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products master:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/leads/use-cases-master', async (req, res) => {
    try {
        const query = 'SELECT use_case_id as id, use_case_name as name, lob_id FROM lob_use_case_master ORDER BY use_case_name';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching use cases master:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/leads/industry-lobs', async (req, res) => {
    try {
        const query = `
            SELECT 
                il.lob_id,
                il.lob_name,
                i.industry_name
            FROM industry_line_of_business il
            JOIN industry_master i ON il.industry_id = i.industry_id
            ORDER BY i.industry_name, il.lob_name
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching industry LOBs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Users (for Generated By)
app.get('/api/leads/users', async (req, res) => {
    try {
        const result = await pool.query("SELECT user_id, full_name, role FROM users WHERE status = 'Active' ORDER BY full_name");
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Stages
app.get('/api/leads/stages', async (req, res) => {
    try {
        const result = await pool.query('SELECT stage_id, stage_name FROM lead_stages ORDER BY stage_id');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching stages:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Statuses
app.get('/api/leads/statuses', async (req, res) => {
    try {
        const result = await pool.query('SELECT status_id, status_name, stage_id FROM lead_stage_status ORDER BY status_id');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching statuses:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check for duplicate account_name or company_website
app.get('/api/accounts/check-duplicate', async (req, res) => {
    try {
        const { account_name, company_website, exclude_account_id } = req.query;

        const result = {
            account_name_exists: false,
            company_website_exists: false,
            existing_account_name: null,
            existing_website_account: null
        };

        // Check account_name duplicate
        if (account_name && account_name.trim()) {
            let nameQuery = 'SELECT account_id, account_name FROM accounts WHERE LOWER(account_name) = LOWER($1)';
            const nameParams = [account_name.trim()];

            if (exclude_account_id) {
                nameQuery += ' AND account_id != $2';
                nameParams.push(exclude_account_id);
            }

            const nameCheck = await pool.query(nameQuery, nameParams);
            if (nameCheck.rows.length > 0) {
                result.account_name_exists = true;
                result.existing_account_name = nameCheck.rows[0].account_name;
            }
        }

        // Check company_website duplicate
        if (company_website && company_website.trim()) {
            let websiteQuery = 'SELECT account_id, account_name, company_website FROM accounts WHERE LOWER(company_website) = LOWER($1)';
            const websiteParams = [company_website.trim()];

            if (exclude_account_id) {
                websiteQuery += ' AND account_id != $2';
                websiteParams.push(exclude_account_id);
            }

            const websiteCheck = await pool.query(websiteQuery, websiteParams);
            if (websiteCheck.rows.length > 0) {
                result.company_website_exists = true;
                result.existing_website_account = websiteCheck.rows[0].account_name;
            }
        }

        res.json(result);
    } catch (err) {
        console.error('Error checking duplicates:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Accounts (Dropdown)
app.get('/api/leads/accounts', async (req, res) => {
    try {
        const result = await pool.query('SELECT account_id, account_name FROM accounts ORDER BY account_name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching accounts:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get All Accounts (Full Details)
app.get('/api/accounts', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.account_id,
                a.created_date,
                a.account_name,
                a.industry,
                a.primary_lob,
                a.head_office as hq_city,
                a.data_completion_score,
                l.lead_id,
                l.stage_id,
                s.stage_name,
                a.account_status,
                a.account_owner,
                a.total_revenue,
                a.last_updated
            FROM accounts a
            LEFT JOIN LATERAL (
                SELECT lead_id, stage_id FROM leads WHERE account_id = a.account_id ORDER BY created_date DESC LIMIT 1
            ) l ON true
            LEFT JOIN lead_stages s ON l.stage_id = s.stage_id
            ORDER BY a.created_date DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all accounts:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Account
app.post('/api/accounts', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            account_name, industry, head_office, location,
            primary_contact_name, contact_person_role, contact_phone,
            contact_email, company_phone, account_status, account_owner, remarks
        } = req.body;

        await client.query('BEGIN');

        // Check duplicate
        const check = await client.query('SELECT account_id FROM accounts WHERE account_name = $1', [account_name]);
        if (check.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Account already exists' });
        }

        const result = await client.query(
            `INSERT INTO accounts (
                account_name, industry, head_office, location,
                primary_contact_name, contact_person_role, contact_phone,
                contact_email, company_phone, account_status, account_owner, remarks,
                created_date, last_updated
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
            RETURNING *`,
            [
                account_name, industry, head_office, location,
                primary_contact_name, contact_person_role, contact_phone,
                contact_email, company_phone, account_status || 'Prospect', account_owner, remarks
            ]
        );

        await client.query('COMMIT');
        res.json({ success: true, account: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create account error:', err);
        res.status(500).json({ error: 'Failed to create account' });
    } finally {
        client.release();
    }
});

// Update Account
app.put('/api/accounts/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const {
            account_name, industry, head_office,
            primary_contact_name, contact_person_role, contact_phone,
            contact_email, company_phone, account_status, account_owner, remarks,
            total_revenue, employee_count, country, data_completion_score, primary_lob,
            company_website
        } = req.body;

        console.log('Update account request for ID:', id);
        console.log('Update account payload:', {
            account_name, industry, head_office, country, total_revenue, employee_count
        });

        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE accounts SET 
                account_name = $1, 
                industry = $2, 
                head_office = $3,
                primary_contact_name = $4, 
                contact_person_role = $5, 
                contact_phone = $6,
                contact_email = $7, 
                company_phone = $8, 
                account_status = $9, 
                account_owner = $10, 
                remarks = $11, 
                total_revenue = $12,
                employee_count = $13, 
                country = $14, 
                data_completion_score = $15,
                primary_lob = $16, 
                company_website = $17,
                last_updated = NOW()
            WHERE account_id = $18
            RETURNING *`,
            [
                account_name || null,
                industry || null,
                head_office || null,
                primary_contact_name || null,
                contact_person_role || null,
                contact_phone || null,
                contact_email || null,
                company_phone || null,
                account_status || 'Prospect',
                account_owner || null,
                remarks || null,
                total_revenue || 0,
                employee_count || 0,
                country || null,
                data_completion_score || 0,
                primary_lob || null,
                company_website || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Account not found' });
        }

        console.log('Account updated successfully in DB. ID:', id);
        await client.query('COMMIT');
        res.json({ success: true, account: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update account error:', err);
        res.status(500).json({ error: 'Failed to update account', details: err.message });
    } finally {
        client.release();
    }
});

// Delete Account
app.delete('/api/accounts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check for dependencies (leads)
        const check = await pool.query('SELECT lead_id FROM leads WHERE account_id = $1 LIMIT 1', [id]);
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Cannot delete account with existing leads' });
        }

        await pool.query('DELETE FROM accounts WHERE account_id = $1', [id]);
        res.json({ success: true, message: 'Account deleted' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// =====================================================
// ACCOUNT DETAILS - FULL DATA WITH RELATED ENTITIES
// =====================================================

// Get Account Full Details (with all related data)
app.get('/api/accounts/:id/full', async (req, res) => {
    const { id } = req.params;
    try {
        // Get account basic info
        const accountResult = await pool.query('SELECT * FROM accounts WHERE account_id = $1', [id]);
        if (accountResult.rows.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        const account = accountResult.rows[0];

        // Get related contacts
        let contacts = [];
        try {
            const contactsResult = await pool.query(
                'SELECT * FROM account_contacts WHERE account_id = $1 ORDER BY id',
                [id]
            );
            contacts = contactsResult.rows;
        } catch (e) {
            console.log('account_contacts table might not exist yet');
        }

        // Get line of business
        let lineOfBusiness = [];
        try {
            const lobResult = await pool.query(
                'SELECT * FROM account_line_of_business WHERE account_id = $1 ORDER BY id',
                [id]
            );
            lineOfBusiness = lobResult.rows;
        } catch (e) {
            console.log('account_line_of_business table might not exist yet');
        }

        // Get departments
        let departments = [];
        try {
            const deptResult = await pool.query(
                'SELECT * FROM account_departments WHERE account_id = $1 ORDER BY id',
                [id]
            );
            departments = deptResult.rows;
        } catch (e) {
            console.log('account_departments table might not exist yet');
        }

        // Get use cases
        let useCases = [];
        try {
            const ucResult = await pool.query(
                'SELECT * FROM account_use_cases WHERE account_id = $1 ORDER BY id',
                [id]
            );
            useCases = ucResult.rows;
        } catch (e) {
            console.log('account_use_cases table might not exist yet');
        }

        // Get pain points for all departments
        let painPoints = [];
        try {
            const ppResult = await pool.query(
                `SELECT dp.*, ad.department_name 
                 FROM department_pain_points dp 
                 LEFT JOIN account_departments ad ON dp.department_id = ad.id 
                 WHERE ad.account_id = $1 
                 ORDER BY dp.id`,
                [id]
            );
            painPoints = ppResult.rows;
        } catch (e) {
            console.log('department_pain_points table might not exist yet');
        }

        res.json({
            ...account,
            contacts,
            lineOfBusiness,
            departments,
            useCases,
            painPoints
        });
    } catch (err) {
        console.error('Get account full error:', err);
        res.status(500).json({ error: 'Failed to get account details' });
    }
});

// =====================================================
// ACCOUNT CONTACTS CRUD
// =====================================================

// Get contacts for an account
app.get('/api/accounts/:id/contacts', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM account_contacts WHERE account_id = $1 ORDER BY id',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get contacts error:', err);
        res.status(500).json({ error: 'Failed to get contacts' });
    }
});

// Create contact
app.post('/api/accounts/:id/contacts', async (req, res) => {
    const { id } = req.params;
    const { name, role, phone, email } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO account_contacts (account_id, name, role, phone, email)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id, name, role, phone, email]
        );
        res.json({ success: true, contact: result.rows[0] });
    } catch (err) {
        console.error('Create contact error:', err);
        res.status(500).json({ error: 'Failed to create contact' });
    }
});

// Update contact
app.put('/api/accounts/:accountId/contacts/:contactId', async (req, res) => {
    const { contactId } = req.params;
    const { name, role, phone, email } = req.body;
    try {
        const result = await pool.query(
            `UPDATE account_contacts SET name = $1, role = $2, phone = $3, email = $4
             WHERE id = $5 RETURNING *`,
            [name, role, phone, email, contactId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json({ success: true, contact: result.rows[0] });
    } catch (err) {
        console.error('Update contact error:', err);
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

// Delete contact
app.delete('/api/accounts/:accountId/contacts/:contactId', async (req, res) => {
    const { contactId } = req.params;
    try {
        await pool.query('DELETE FROM account_contacts WHERE id = $1', [contactId]);
        res.json({ success: true, message: 'Contact deleted' });
    } catch (err) {
        console.error('Delete contact error:', err);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// =====================================================
// ACCOUNT LINE OF BUSINESS CRUD
// =====================================================

// Get line of business for an account
app.get('/api/accounts/:id/line-of-business', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM account_line_of_business WHERE account_id = $1 ORDER BY id',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get line of business error:', err);
        res.status(500).json({ error: 'Failed to get line of business' });
    }
});

// Create line of business
app.post('/api/accounts/:id/line-of-business', async (req, res) => {
    const { id } = req.params;
    const { business_type, description } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO account_line_of_business (account_id, business_type, description)
             VALUES ($1, $2, $3) RETURNING *`,
            [id, business_type, description]
        );
        res.json({ success: true, lineOfBusiness: result.rows[0] });
    } catch (err) {
        console.error('Create line of business error:', err);
        res.status(500).json({ error: 'Failed to create line of business' });
    }
});

// Update line of business
app.put('/api/accounts/:accountId/line-of-business/:lobId', async (req, res) => {
    const { lobId } = req.params;
    const { business_type, description } = req.body;
    try {
        const result = await pool.query(
            `UPDATE account_line_of_business SET business_type = $1, description = $2
             WHERE id = $3 RETURNING *`,
            [business_type, description, lobId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Line of business not found' });
        }
        res.json({ success: true, lineOfBusiness: result.rows[0] });
    } catch (err) {
        console.error('Update line of business error:', err);
        res.status(500).json({ error: 'Failed to update line of business' });
    }
});

// Delete line of business
app.delete('/api/accounts/:accountId/line-of-business/:lobId', async (req, res) => {
    const { lobId } = req.params;
    try {
        await pool.query('DELETE FROM account_line_of_business WHERE id = $1', [lobId]);
        res.json({ success: true, message: 'Line of business deleted' });
    } catch (err) {
        console.error('Delete line of business error:', err);
        res.status(500).json({ error: 'Failed to delete line of business' });
    }
});

// =====================================================
// ACCOUNT DEPARTMENTS CRUD
// =====================================================

// Get departments for an account
app.get('/api/accounts/:id/departments', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM account_departments WHERE account_id = $1 ORDER BY id',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get departments error:', err);
        res.status(500).json({ error: 'Failed to get departments' });
    }
});

// Create department
app.post('/api/accounts/:id/departments', async (req, res) => {
    const { id } = req.params;
    const { department_name, head_name } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO account_departments (account_id, department_name, head_name)
             VALUES ($1, $2, $3) RETURNING *`,
            [id, department_name, head_name]
        );
        res.json({ success: true, department: result.rows[0] });
    } catch (err) {
        console.error('Create department error:', err);
        res.status(500).json({ error: 'Failed to create department' });
    }
});

// Update department
app.put('/api/accounts/:accountId/departments/:deptId', async (req, res) => {
    const { deptId } = req.params;
    const { department_name, head_name } = req.body;
    try {
        const result = await pool.query(
            `UPDATE account_departments SET department_name = $1, head_name = $2
             WHERE id = $3 RETURNING *`,
            [department_name, head_name, deptId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json({ success: true, department: result.rows[0] });
    } catch (err) {
        console.error('Update department error:', err);
        res.status(500).json({ error: 'Failed to update department' });
    }
});

// Delete department
app.delete('/api/accounts/:accountId/departments/:deptId', async (req, res) => {
    const { deptId } = req.params;
    try {
        // Also delete related pain points
        await pool.query('DELETE FROM department_pain_points WHERE department_id = $1', [deptId]);
        await pool.query('DELETE FROM account_departments WHERE id = $1', [deptId]);
        res.json({ success: true, message: 'Department deleted' });
    } catch (err) {
        console.error('Delete department error:', err);
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

// =====================================================
// ACCOUNT USE CASES CRUD
// =====================================================

// Get use cases for an account
app.get('/api/accounts/:id/use-cases', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM account_use_cases WHERE account_id = $1 ORDER BY id',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get use cases error:', err);
        res.status(500).json({ error: 'Failed to get use cases' });
    }
});

// Create use case
app.post('/api/accounts/:id/use-cases', async (req, res) => {
    const { id } = req.params;
    const { use_case_title, description, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO account_use_cases (account_id, use_case_title, description, status)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [id, use_case_title, description, status || 'Identified']
        );
        res.json({ success: true, useCase: result.rows[0] });
    } catch (err) {
        console.error('Create use case error:', err);
        res.status(500).json({ error: 'Failed to create use case' });
    }
});

// Update use case
app.put('/api/accounts/:accountId/use-cases/:ucId', async (req, res) => {
    const { ucId } = req.params;
    const { use_case_title, description, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE account_use_cases SET use_case_title = $1, description = $2, status = $3
             WHERE id = $4 RETURNING *`,
            [use_case_title, description, status, ucId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Use case not found' });
        }
        res.json({ success: true, useCase: result.rows[0] });
    } catch (err) {
        console.error('Update use case error:', err);
        res.status(500).json({ error: 'Failed to update use case' });
    }
});

// Delete use case
app.delete('/api/accounts/:accountId/use-cases/:ucId', async (req, res) => {
    const { ucId } = req.params;
    try {
        await pool.query('DELETE FROM account_use_cases WHERE id = $1', [ucId]);
        res.json({ success: true, message: 'Use case deleted' });
    } catch (err) {
        console.error('Delete use case error:', err);
        res.status(500).json({ error: 'Failed to delete use case' });
    }
});

// =====================================================
// DEPARTMENT PAIN POINTS CRUD
// =====================================================

// Get pain points for a department
app.get('/api/departments/:deptId/pain-points', async (req, res) => {
    const { deptId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM department_pain_points WHERE department_id = $1 ORDER BY id',
            [deptId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get pain points error:', err);
        res.status(500).json({ error: 'Failed to get pain points' });
    }
});

// Create pain point
app.post('/api/departments/:deptId/pain-points', async (req, res) => {
    const { deptId } = req.params;
    const { pain_point, severity, notes } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO department_pain_points (department_id, pain_point, severity, notes)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [deptId, pain_point, severity || 'Medium', notes]
        );
        res.json({ success: true, painPoint: result.rows[0] });
    } catch (err) {
        console.error('Create pain point error:', err);
        res.status(500).json({ error: 'Failed to create pain point' });
    }
});

// Update pain point
app.put('/api/departments/:deptId/pain-points/:ppId', async (req, res) => {
    const { ppId } = req.params;
    const { pain_point, severity, notes } = req.body;
    try {
        const result = await pool.query(
            `UPDATE department_pain_points SET pain_point = $1, severity = $2, notes = $3
             WHERE id = $4 RETURNING *`,
            [pain_point, severity, notes, ppId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pain point not found' });
        }
        res.json({ success: true, painPoint: result.rows[0] });
    } catch (err) {
        console.error('Update pain point error:', err);
        res.status(500).json({ error: 'Failed to update pain point' });
    }
});

// Delete pain point
app.delete('/api/departments/:deptId/pain-points/:ppId', async (req, res) => {
    const { ppId } = req.params;
    try {
        await pool.query('DELETE FROM department_pain_points WHERE id = $1', [ppId]);
        res.json({ success: true, message: 'Pain point deleted' });
    } catch (err) {
        console.error('Delete pain point error:', err);
        res.status(500).json({ error: 'Failed to delete pain point' });
    }
});

// Get Dashboard Stats
app.get('/api/dashboard', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            // 1. Counts & Sums
            // Revenue: Sum of expected_value for leads in 'Closed Won' stage (assuming stage_id for Closed Won is known or joined)
            // Pipeline: Sum of expected_value for leads NOT in 'Closed Won' or 'Closed Lost'

            // We need to know stage IDs for Won/Lost. Let's assume joining on names is safer or fetching them first.
            // A single query with CTEs or subqueries is efficient.

            const statsQuery = `
                WITH StageCounts AS (
                    SELECT 
                        s.stage_name, 
                        COUNT(l.lead_id) as count,
                        COALESCE(SUM(l.expected_value), 0) as value
                    FROM lead_stages s
                    LEFT JOIN leads l ON s.stage_id = l.stage_id
                    GROUP BY s.stage_name
                ),
                Totals AS (
                    SELECT 
                        (SELECT COUNT(*) FROM leads) as total_leads,
                        (SELECT COUNT(*) FROM accounts) as total_accounts,
                        (SELECT COUNT(*) FROM leads WHERE next_followup_date::date = CURRENT_DATE) as today_followups
                )
                SELECT 
                    t.*,
                    (SELECT COALESCE(SUM(l.expected_value), 0) FROM leads l JOIN lead_stages s ON l.stage_id = s.stage_id WHERE s.stage_name = 'Closed Won') as total_revenue,
                    (SELECT COALESCE(SUM(l.expected_value), 0) FROM leads l JOIN lead_stages s ON l.stage_id = s.stage_id WHERE s.stage_name NOT IN ('Closed Won', 'Closed Lost')) as expected_pipeline
                FROM Totals t;
            `;

            const statsResult = await client.query(statsQuery);
            const stats = statsResult.rows[0];

            // 2. Leads by Stage (from the CTE logic effectively, or just query again for clean list)
            const stagesQuery = `
                SELECT s.stage_name as name, COUNT(l.lead_id)::int as count 
                FROM lead_stages s 
                LEFT JOIN leads l ON s.stage_id = l.stage_id 
                GROUP BY s.stage_id, s.stage_name 
                ORDER BY s.stage_id
            `;
            const stagesResult = await client.query(stagesQuery);

            // 3. Recent Leads
            const recentLeadsQuery = `
                 SELECT 
                    l.lead_id,
                    l.lead_date,
                    a.account_name,
                    u.full_name as generated_by_name,
                    l.lead_source,
                    s.stage_name,
                    l.expected_value
                FROM leads l
                LEFT JOIN accounts a ON l.account_id = a.account_id
                LEFT JOIN users u ON l.lead_generated_by = u.user_id
                LEFT JOIN lead_stages s ON l.stage_id = s.stage_id
                ORDER BY l.created_date DESC
                LIMIT 5
            `;
            const recentLeadsResult = await client.query(recentLeadsQuery);

            // 4. Call Stats Today (Global)
            const callStatsQuery = `
                SELECT
                    COUNT(*) as calls_today,
                    COUNT(*) FILTER (WHERE call_outcome = 'No Answer') as no_answer,
                    COUNT(*) FILTER (WHERE call_outcome = 'Busy') as busy,
                    COUNT(*) FILTER (WHERE call_outcome = 'Call Back Later') as callback,
                    COUNT(*) FILTER (WHERE call_outcome = 'Interested') as interested,
                    COUNT(*) FILTER (WHERE call_outcome = 'Not Interested') as not_interested
                FROM lead_call_logs
                WHERE created_at::date = CURRENT_DATE
            `;
            const callStatsResult = await client.query(callStatsQuery);
            const callStats = callStatsResult.rows[0];

            res.json({
                totalLeads: parseInt(stats.total_leads),
                totalAccounts: parseInt(stats.total_accounts),
                totalRevenue: parseFloat(stats.total_revenue),
                expectedPipeline: parseFloat(stats.expected_pipeline),
                todayFollowups: parseInt(stats.today_followups),
                leadsByStage: stagesResult.rows,
                recentLeads: recentLeadsResult.rows,
                callsToday: parseInt(callStats.calls_today),
                outcomes: {
                    noAnswer: parseInt(callStats.no_answer),
                    busy: parseInt(callStats.busy),
                    callback: parseInt(callStats.callback),
                    interested: parseInt(callStats.interested),
                    notInterested: parseInt(callStats.not_interested)
                }
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get All Leads (with joined details)
app.get('/api/leads', async (req, res) => {
    try {
        const query = `
            SELECT
                l.lead_id,
                l.account_id,
                l.lead_date,
                a.account_name,
                u.full_name as generated_by,
                ud.full_name as de_assigned_to_name,
                l.de_assigned_to,
                l.lead_source,
                l.stage_id,
                s.stage_name,
                l.status_id,
                st.status_name,
                i.industry_name as industry,
                a.primary_lob,
                c.city_name as hq_city,
                a.data_completion_score,
                l.expected_value,
                l.last_contacted_at,
                l.next_followup_at,
                l.product_mapped,
                lc.call_outcome as last_call_outcome
            FROM leads l
            LEFT JOIN accounts a ON l.account_id = a.account_id
            LEFT JOIN users u ON l.lead_generated_by = u.user_id
            LEFT JOIN users ud ON l.de_assigned_to = ud.user_id
            LEFT JOIN lead_stages s ON l.stage_id = s.stage_id
            LEFT JOIN lead_stage_status st ON l.status_id = st.status_id
            LEFT JOIN industry_master i ON a.industry = i.industry_name
            LEFT JOIN city_master c ON LOWER(a.head_office) = LOWER(c.city_name)
            LEFT JOIN LATERAL (
                SELECT call_outcome FROM lead_call_logs WHERE lead_id = l.lead_id ORDER BY call_datetime DESC LIMIT 1
            ) lc ON true
            ORDER BY l.created_date DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching leads:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Lead Stats (Counts by User for Today, Yesterday, This Week, This Month)
app.get('/api/dashboard/user-stats', async (req, res) => {
    try {
        const query = `
            WITH lead_counts AS (
                SELECT
                    u.user_id,
                    u.full_name,
                    u.role,
                    COUNT(l.lead_id) FILTER (WHERE l.created_date::date = CURRENT_DATE) as today,
                    COUNT(l.lead_id) FILTER (WHERE l.created_date::date = CURRENT_DATE - INTERVAL '1 day') as yesterday,
                    COUNT(l.lead_id) FILTER (WHERE l.created_date >= date_trunc('week', CURRENT_DATE)) as this_week,
                    COUNT(l.lead_id) FILTER (WHERE l.created_date >= date_trunc('month', CURRENT_DATE)) as this_month
                FROM users u
                LEFT JOIN leads l ON u.user_id = l.lead_generated_by
                WHERE u.status = 'Active'
                GROUP BY u.user_id, u.full_name, u.role
            ),
            call_counts AS (
                SELECT
                    telecaller_user_id,
                    COUNT(*) as calls_today,
                    COUNT(*) FILTER (WHERE call_outcome = 'No Answer') as no_answer,
                    COUNT(*) FILTER (WHERE call_outcome = 'Busy') as busy,
                    COUNT(*) FILTER (WHERE call_outcome = 'Call Back Later') as callback,
                    COUNT(*) FILTER (WHERE call_outcome = 'Interested') as interested,
                    COUNT(*) FILTER (WHERE call_outcome = 'Not Interested') as not_interested
                FROM lead_call_logs
                WHERE created_at::date = CURRENT_DATE
                GROUP BY telecaller_user_id
            )
            SELECT
                lc.*,
                COALESCE(cc.calls_today, 0) as calls_today,
                COALESCE(cc.no_answer, 0) as no_answer,
                COALESCE(cc.busy, 0) as busy,
                COALESCE(cc.callback, 0) as callback,
                COALESCE(cc.interested, 0) as interested,
                COALESCE(cc.not_interested, 0) as not_interested
            FROM lead_counts lc
            LEFT JOIN call_counts cc ON lc.user_id = cc.telecaller_user_id
            ORDER BY lc.today DESC, lc.full_name ASC
        `;
        const result = await pool.query(query);

        // Format numbers as integers
        const stats = result.rows.map(row => ({
            user_id: row.user_id,
            full_name: row.full_name,
            role: row.role,
            today: parseInt(row.today),
            yesterday: parseInt(row.yesterday),
            thisWeek: parseInt(row.this_week),
            thisMonth: parseInt(row.this_month),
            callsToday: parseInt(row.calls_today),
            outcomes: {
                noAnswer: parseInt(row.no_answer),
                busy: parseInt(row.busy),
                callback: parseInt(row.callback),
                interested: parseInt(row.interested),
                notInterested: parseInt(row.not_interested)
            }
        }));

        res.json(stats);
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Lead Stats (Counts for Today, Yesterday, This Week, This Month)
app.get('/api/leads/stats', async (req, res) => {
    const { stage_ids } = req.query;
    let stageFilter = '';
    const params = [];

    if (stage_ids) {
        const ids = stage_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        if (ids.length > 0) {
            stageFilter = `AND stage_id = ANY($1::int[])`;
            params.push(ids);
        }
    }

    try {
        const query = `
            SELECT
                COUNT(*) FILTER (WHERE created_date::date = CURRENT_DATE) as today,
                COUNT(*) FILTER (WHERE created_date::date = CURRENT_DATE - INTERVAL '1 day') as yesterday,
                COUNT(*) FILTER (WHERE created_date >= date_trunc('week', CURRENT_DATE)) as this_week,
                COUNT(*) FILTER (WHERE created_date >= date_trunc('month', CURRENT_DATE)) as this_month,
                (SELECT COUNT(*) FROM lead_call_logs WHERE created_at::date = CURRENT_DATE) as calls_today,
                (SELECT COUNT(*) FROM lead_call_logs WHERE created_at::date = CURRENT_DATE AND call_outcome = 'No Answer') as no_answer,
                (SELECT COUNT(*) FROM lead_call_logs WHERE created_at::date = CURRENT_DATE AND call_outcome = 'Busy') as busy,
                (SELECT COUNT(*) FROM lead_call_logs WHERE created_at::date = CURRENT_DATE AND call_outcome = 'Call Back Later') as callback,
                (SELECT COUNT(*) FROM lead_call_logs WHERE created_at::date = CURRENT_DATE AND call_outcome = 'Interested') as interested,
                (SELECT COUNT(*) FROM lead_call_logs WHERE created_at::date = CURRENT_DATE AND call_outcome = 'Not Interested') as not_interested
            FROM leads
            WHERE 1=1 ${stageFilter}
        `;
        const result = await pool.query(query, params);
        const stats = result.rows[0];
        res.json({
            today: parseInt(stats.today),
            yesterday: parseInt(stats.yesterday),
            thisWeek: parseInt(stats.this_week),
            thisMonth: parseInt(stats.this_month),
            callsToday: parseInt(stats.calls_today),
            outcomes: {
                noAnswer: parseInt(stats.no_answer),
                busy: parseInt(stats.busy),
                callback: parseInt(stats.callback),
                interested: parseInt(stats.interested),
                notInterested: parseInt(stats.not_interested)
            }
        });
    } catch (err) {
        console.error('Error fetching lead stats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Single Lead (with full details for editing)
// IMPORTANT: Specific routes must be defined BEFORE the generic /:id route

// Get Cities (Dropdown)
app.get('/api/leads/cities', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM city_master ORDER BY city_name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching cities:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Industry LOBs (Dropdown)
app.get('/api/leads/industry-lobs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM industry_line_of_business ORDER BY lob_name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching industry LOBs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/leads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                l.*,
                a.account_name,
                a.industry,
                a.head_office,
                a.location,
                a.primary_contact_name,
                a.contact_person_role,
                a.contact_phone,
                a.contact_email,
                a.company_phone,
                a.primary_lob,
                a.data_completion_score,
                u.full_name as generated_by_name,
                ud.full_name as de_assigned_to_name,
                s.stage_name,
                st.status_name,
                i.industry_name,
                c.city_name as hq_city
            FROM leads l
            LEFT JOIN accounts a ON l.account_id = a.account_id
            LEFT JOIN industry_master i ON a.industry = i.industry_name
            LEFT JOIN city_master c ON LOWER(a.head_office) = LOWER(c.city_name)
            LEFT JOIN users u ON l.lead_generated_by = u.user_id
            LEFT JOIN users ud ON l.de_assigned_to = ud.user_id
            LEFT JOIN lead_stages s ON l.stage_id = s.stage_id
            LEFT JOIN lead_stage_status st ON l.status_id = st.status_id
            WHERE l.lead_id = $1
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching lead:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Lead (Transactional)
app.put('/api/leads/:id', async (req, res) => {
    const { id } = req.params;
    const {
        account_name,
        industry,
        head_office,
        location,
        company_website,
        primary_contact_name,
        contact_person_role,
        contact_phone,
        contact_email,
        company_phone,
        lead_source,
        lead_generated_by,
        stage_id,
        status_id,
        product_mapped
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get account_id from the lead
        const leadCheck = await client.query('SELECT account_id FROM leads WHERE lead_id = $1', [id]);
        if (leadCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Lead not found' });
        }
        const account_id = leadCheck.rows[0].account_id;

        // 2. Update Account (only if account fields provided)
        if (account_name || industry || location || primary_contact_name || contact_phone || contact_email) {
            await client.query(
                `UPDATE accounts SET
                    account_name = COALESCE($1, account_name),
                    industry = COALESCE($2, industry),
                    head_office = COALESCE($3, head_office),
                    location = COALESCE($4, location),
                    primary_contact_name = COALESCE($5, primary_contact_name),
                    contact_person_role = COALESCE($6, contact_person_role),
                    contact_phone = COALESCE($7, contact_phone),
                    contact_email = COALESCE($8, contact_email),
                    company_phone = COALESCE($9, company_phone)
                WHERE account_id = $10`,
                [
                    account_name || null,
                    industry || null,
                    head_office || null,
                    location || null,
                    primary_contact_name || null,
                    contact_person_role || null,
                    contact_phone || null,
                    contact_email || null,
                    company_phone || null,
                    account_id
                ]
            );
        }

        // 3. Update Lead
        await client.query(
            `UPDATE leads SET
                lead_source = COALESCE($1, lead_source),
                lead_generated_by = COALESCE($2, lead_generated_by),
                stage_id = COALESCE($3, stage_id),
                status_id = COALESCE($4, status_id),
                product_mapped = COALESCE($5, product_mapped)
            WHERE lead_id = $6`,
            [
                lead_source || null,
                lead_generated_by || null,
                stage_id || null,
                status_id || null,
                product_mapped || null,
                id
            ]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Lead updated successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating lead:', error);
        res.status(500).json({ error: 'Failed to update lead', details: error.message });
    } finally {
        client.release();
    }
});

// Create Lead (Transactional)
app.post('/api/leads', async (req, res) => {
    const {
        account_name,
        industry,
        head_office,
        location,
        company_website,
        primary_contact_name,
        contact_person_role,
        contact_phone,
        contact_email,
        company_phone,
        lead_source,
        lead_generated_by,
        stage_id,
        status_id
    } = req.body;

    // Validate mandatory fields
    if (!account_name || !account_name.trim()) {
        return res.status(400).json({
            error: 'Account Name is required',
            field: 'account_name'
        });
    }

    if (!company_website || !company_website.trim()) {
        return res.status(400).json({
            error: 'Company Website is required',
            field: 'company_website'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check for duplicate account_name
        const checkAccountName = await client.query(
            'SELECT account_id, account_name FROM accounts WHERE LOWER(account_name) = LOWER($1)',
            [account_name.trim()]
        );

        if (checkAccountName.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                error: `Account "${checkAccountName.rows[0].account_name}" already exists`,
                field: 'account_name',
                duplicate: true
            });
        }

        // Check for duplicate company_website
        const checkWebsite = await client.query(
            'SELECT account_id, account_name, company_website FROM accounts WHERE LOWER(company_website) = LOWER($1)',
            [company_website.trim()]
        );

        if (checkWebsite.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                error: `Website already exists for account "${checkWebsite.rows[0].account_name}"`,
                field: 'company_website',
                duplicate: true
            });
        }

        // Insert new account with company_website
        const insertAccount = await client.query(
            `INSERT INTO accounts(
                account_name, industry, head_office, location,
                company_website, primary_contact_name, contact_person_role, 
                contact_phone, contact_email, company_phone, 
                account_status, created_date, last_updated
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Prospect', NOW(), NOW())
            RETURNING account_id`,
            [account_name.trim(), industry, head_office, location,
            company_website.trim(), primary_contact_name, contact_person_role,
                contact_phone, contact_email, company_phone]
        );
        const account_id = insertAccount.rows[0].account_id;

        // Insert the lead
        const leadResult = await client.query(
            `INSERT INTO leads(
                account_id, lead_date, lead_source, lead_generated_by,
                stage_id, status_id, created_date
            ) VALUES($1, NOW(), $2, $3, $4, $5, NOW())
            RETURNING lead_id`,
            [account_id, lead_source, lead_generated_by, stage_id, status_id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            lead_id: leadResult.rows[0].lead_id,
            account_id: account_id,
            message: 'Lead created successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating lead:', error);
        res.status(500).json({ error: 'Failed to create lead', details: error.message });
    } finally {
        client.release();
    }
});

// =====================================================
// BULK IMPORT ENDPOINT FOR N8N INTEGRATION
// =====================================================
// This endpoint accepts leads from Google Sheets via n8n
app.post('/api/leads/bulk-import', async (req, res) => {
    const leads = Array.isArray(req.body) ? req.body : [req.body];
    const results = { success: 0, failed: 0, errors: [] };

    for (const leadData of leads) {
        const client = await pool.connect();
        try {
            const {
                // Spreadsheet field mappings
                company_name,       // COMPANY NAME
                service_offered,    // SERVICE OFFERED -> industry
                website,            // WEBSITE -> company_website
                district,           // DISTRICT -> location
                contact_person,     // CONTACT PERSON NAME -> primary_contact_name
                phone,              // LL/ MOBILE NO -> contact_phone
                email,              // EMAIL ID -> contact_email
                call_status,        // CALL STATUS -> call_status
                follow_up_1,        // Follow Up Status 1 -> follow_up_status_1
                follow_up_2,        // Follow Up Status 2 -> follow_up_status_2
                status,             // STATUS column
                // Optional overrides
                lead_source = 'Spreadsheet Import',
                lead_generated_by = 1,
                stage_id = 1,
                status_id = 1
            } = leadData;

            // Skip empty rows
            if (!company_name || company_name.trim() === '') {
                continue;
            }

            await client.query('BEGIN');

            // Check if account already exists
            const checkAccount = await client.query(
                'SELECT account_id FROM accounts WHERE account_name = $1',
                [company_name]
            );

            let account_id;

            if (checkAccount.rows.length > 0) {
                // Update existing account
                account_id = checkAccount.rows[0].account_id;
                await client.query(
                    `UPDATE accounts SET
                        industry = COALESCE($2, industry),
                        location = COALESCE($3, location),
                        primary_contact_name = COALESCE($4, primary_contact_name),
                        contact_phone = COALESCE($5, contact_phone),
                        contact_email = COALESCE($6, contact_email),
                        company_website = COALESCE($7, company_website),
                        last_updated = NOW()
                    WHERE account_id = $1`,
                    [account_id, service_offered, district, contact_person, phone, email, website]
                );
            } else {
                // Insert new account
                const insertAccount = await client.query(
                    `INSERT INTO accounts(
                        account_name, industry, location,
                        primary_contact_name, contact_phone,
                        contact_email, company_website, account_status, 
                        created_date, last_updated
                    ) VALUES($1, $2, $3, $4, $5, $6, $7, 'Prospect', NOW(), NOW())
                    RETURNING account_id`,
                    [company_name, service_offered, district, contact_person, phone, email, website]
                );
                account_id = insertAccount.rows[0].account_id;
            }

            // Insert the lead with follow-up status fields
            await client.query(
                `INSERT INTO leads(
                    account_id, lead_date, lead_source, lead_generated_by,
                    stage_id, status_id, call_status, 
                    follow_up_status_1, follow_up_status_2,
                    remarks, created_date
                ) VALUES($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
                [account_id, lead_source, lead_generated_by, stage_id, status_id,
                    call_status, follow_up_1, follow_up_2, status]
            );

            await client.query('COMMIT');
            results.success++;

        } catch (error) {
            await client.query('ROLLBACK');
            results.failed++;
            results.errors.push({
                company: leadData.company_name,
                error: error.message
            });
            console.error('Error importing lead:', error.message);
        } finally {
            client.release();
        }
    }

    res.json({
        message: `Import complete: ${results.success} succeeded, ${results.failed} failed`,
        ...results
    });
});

// Single lead import endpoint for n8n (webhook style)
app.post('/api/webhooks/n8n-lead', async (req, res) => {
    // Redirect to bulk import with single item
    req.body = [req.body];
    const leads = [req.body[0]];

    // Process single lead using the same logic
    const client = await pool.connect();
    try {
        const leadData = req.body;
        const {
            company_name,
            service_offered,
            website,
            district,
            contact_person,
            phone,
            email,
            call_status,
            follow_up_1,
            follow_up_2,
            status,
            lead_source = 'n8n Webhook',
            lead_generated_by = 1,
            stage_id = 1,
            status_id = 1
        } = leadData;

        if (!company_name || company_name.trim() === '') {
            return res.status(400).json({ error: 'company_name is required' });
        }

        await client.query('BEGIN');

        const checkAccount = await client.query(
            'SELECT account_id FROM accounts WHERE account_name = $1',
            [company_name]
        );

        let account_id;
        if (checkAccount.rows.length > 0) {
            account_id = checkAccount.rows[0].account_id;
        } else {
            const insertAccount = await client.query(
                `INSERT INTO accounts(
                    account_name, industry, location,
                    primary_contact_name, contact_phone,
                    contact_email, company_website, account_status, 
                    created_date, last_updated
                ) VALUES($1, $2, $3, $4, $5, $6, $7, 'Prospect', NOW(), NOW())
                RETURNING account_id`,
                [company_name, service_offered, district, contact_person, phone, email, website]
            );
            account_id = insertAccount.rows[0].account_id;
        }

        const leadResult = await client.query(
            `INSERT INTO leads(
                account_id, lead_date, lead_source, lead_generated_by,
                stage_id, status_id, call_status, 
                follow_up_status_1, follow_up_status_2,
                remarks, created_date
            ) VALUES($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING lead_id`,
            [account_id, lead_source, lead_generated_by, stage_id, status_id,
                call_status, follow_up_1, follow_up_2, status]
        );

        await client.query('COMMIT');
        res.json({
            success: true,
            lead_id: leadResult.rows[0].lead_id,
            message: 'Lead imported successfully'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Webhook import error:', error);
        res.status(500).json({ error: 'Failed to import lead', details: error.message });
    } finally {
        client.release();
    }
});

// Update Lead Stage/Status Only (Simple update without requiring all fields)
app.patch('/api/leads/:id/stage', async (req, res) => {
    const { id } = req.params;
    const { stage_id, status_id } = req.body;

    try {
        // Check if lead exists and get current values
        const leadCheck = await pool.query('SELECT lead_id, status_id FROM leads WHERE lead_id = $1', [id]);
        if (leadCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Use provided status_id or keep existing
        const finalStatusId = status_id !== undefined ? status_id : leadCheck.rows[0].status_id;

        // Update only stage and status
        await pool.query(
            `UPDATE leads SET stage_id = $1, status_id = $2 WHERE lead_id = $3`,
            [stage_id, finalStatusId, id]
        );

        res.json({
            success: true,
            message: 'Lead stage updated successfully'
        });
    } catch (error) {
        console.error('Error updating lead stage:', error);
        res.status(500).json({ error: 'Failed to update lead stage', details: error.message });
    }
});

// Update Lead DE Assignment
app.patch('/api/leads/:id/de-assignment', async (req, res) => {
    const { id } = req.params;
    const { de_assigned_to } = req.body;
    console.log('Update DE assigned:', { id, de_assigned_to });
    try {
        await pool.query(
            'UPDATE leads SET de_assigned_to = $1 WHERE lead_id = $2',
            [de_assigned_to, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Update DE assignment error:', err);
        res.status(500).json({ error: 'Failed to update DE assignment' });
    }
});

// Delete Lead
app.delete('/api/leads/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if lead exists
        const checkLead = await client.query('SELECT account_id FROM leads WHERE lead_id = $1', [id]);
        if (checkLead.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Delete the lead
        await client.query('DELETE FROM leads WHERE lead_id = $1', [id]);

        await client.query('COMMIT');
        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting lead:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// =====================================================
// TELECALL LOGS V2 - IMMUTABLE HISTORY
// =====================================================

// Log a call and update lead summary
app.post('/api/calls', async (req, res) => {
    const {
        lead_id,
        account_id,
        telecaller_user_id,
        call_outcome,
        notes,
        followup_required,
        followup_datetime
    } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert Call Log
        const logResult = await client.query(
            `INSERT INTO lead_call_logs (
                lead_id, account_id, telecaller_user_id, 
                call_outcome, notes, followup_required, followup_datetime
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [lead_id, account_id, telecaller_user_id, call_outcome, notes, followup_required || false, followup_datetime || null]
        );

        // 2. Update Lead Summary Fields
        // We update last_contacted_at to NOW and next_followup_at if provided
        await client.query(
            `UPDATE leads SET 
                last_contacted_at = NOW(),
                next_followup_at = $1
            WHERE lead_id = $2`,
            [followup_datetime || null, lead_id]
        );

        await client.query('COMMIT');
        res.json({
            success: true,
            message: 'Call logged successfully',
            call_log: logResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error logging call:', error);
        res.status(500).json({ error: 'Failed to log call', details: error.message });
    } finally {
        client.release();
    }
});

// Get call history for a specific lead
app.get('/api/leads/:id/calls', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                lcl.*,
                u.full_name as telecaller_name
            FROM lead_call_logs lcl
            LEFT JOIN users u ON lcl.telecaller_user_id = u.user_id
            WHERE lcl.lead_id = $1
            ORDER BY lcl.call_datetime DESC
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching call history:', error);
        res.status(500).json({ error: 'Failed to fetch call history' });
    }
});

// --- Auth & User Management Endpoints ---

// Login
// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login Request:', email, password);

    try {
        // SUPER BYPASS: Check email (or username) and allow ANY password
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail === 'jananimohan44@gmail.com' || cleanEmail === 'janani04') {
            console.log('Login: Using User Bypass');

            // Try to get real user from DB
            const result = await pool.query('SELECT * FROM users WHERE email = $1', ['jananimohan44@gmail.com']);
            if (result.rows.length > 0) {
                const user = result.rows[0];
                const { password: _, ...userWithoutPassword } = user;
                return res.json({ success: true, user: userWithoutPassword });
            } else {
                // FALLBACK: Return Mock Admin if DB fails
                console.log('Login: User not found in DB, returning MOCK Admin');
                return res.json({
                    success: true,
                    user: {
                        user_id: 1,
                        full_name: 'Janani Mohan (Rescue)',
                        email: 'jananimohan44@gmail.com',
                        role: 'Admin',
                        status: 'Active'
                    }
                });
            }
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            // Try case-insensitive fallback
            const fallback = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
            if (fallback.rows.length === 0) {
                // DEBUG INFO IN ERROR
                return res.status(401).json({ error: `Invalid email.Received: '${email}'` });
            }
            // Use fallback result
            const user = fallback.rows[0];
            if (user.password !== password) {
                return res.status(401).json({ error: `Invalid password.Received: '${password}'` });
            }
            const { password: _, ...userWithoutPassword } = user;
            return res.json({ success: true, user: userWithoutPassword });
        }

        const user = result.rows[0];
        if (user.password !== password) {
            return res.status(401).json({ error: `Invalid password.Expecting '${user.password}' vs '${password}'` });
        }

        // Return user info (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Create User
app.post('/api/users', async (req, res) => {
    const { full_name, email, password, role, phone, status } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if email exists
        const check = await client.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Get new ID
        const maxId = await client.query('SELECT MAX(user_id) as max FROM users');
        const newId = (maxId.rows[0].max || 0) + 1;

        await client.query(
            'INSERT INTO users (user_id, full_name, email, password, role, phone, status, created_date) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
            [newId, full_name, email, password, role || 'Intern', phone, status || 'Active']
        );

        await client.query('COMMIT');
        res.json({ success: true, message: 'User created' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create user error:', err);
        res.status(500).json({ error: 'Failed to create user' });
    } finally {
        client.release();
    }
});

// Update User
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { full_name, email, role, phone, status, password } = req.body;

    try {
        let query = 'UPDATE users SET full_name = $1, email = $2, role = $3, phone = $4, status = $5';
        let params = [full_name, email, role, phone, status];

        if (password) {
            query += ', password = $6 WHERE user_id = $7';
            params.push(password, id);
        } else {
            query += ' WHERE user_id = $6';
            params.push(id);
        }

        await pool.query(query, params);
        res.json({ success: true, message: 'User updated' });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE user_id = $1', [id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// DEBUG: Manual Password Reset
app.get('/api/debug-reset', async (req, res) => {
    try {
        const adminEmail = 'jananimohan44@gmail.com';
        const adminPass = 'janani04';
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [adminPass, adminEmail]);
        res.json({ success: true, message: 'Admin password manually reset to janani04' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// LEAD CALL LOGS API
// ==========================================

// Create a new lead call log and update lead state
app.post('/api/lead-call-logs', async (req, res) => {
    const {
        lead_id, account_id, telecaller_user_id,
        call_outcome, notes, followup_required, followup_datetime,
        call_duration_seconds, stage_id
    } = req.body;

    if (!lead_id || !account_id || !telecaller_user_id || !call_outcome) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert into lead_call_logs
        const logResult = await client.query(
            `INSERT INTO lead_call_logs (
                lead_id, account_id, telecaller_user_id, 
                call_outcome, notes, followup_required, followup_datetime, 
                call_duration_seconds
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [lead_id, account_id, telecaller_user_id, call_outcome, notes, followup_required, followup_datetime, call_duration_seconds]
        );

        // 2. Update leads table state
        let updateQuery = 'UPDATE leads SET last_contacted_at = NOW()';
        const updateValues = [];
        let paramIndex = 1;

        if (followup_datetime) {
            updateQuery += `, next_followup_at = $${paramIndex++}`;
            updateValues.push(followup_datetime);
        } else if (followup_required === false) {
            // Optional: clear followup if not required? Users might want this.
            updateQuery += `, next_followup_at = NULL`;
        }

        if (stage_id) {
            updateQuery += `, stage_id = $${paramIndex++}`;
            updateValues.push(stage_id);
        }

        updateQuery += ` WHERE lead_id = $${paramIndex++}`;
        updateValues.push(lead_id);

        await client.query(updateQuery, updateValues);

        await client.query('COMMIT');
        res.status(201).json(logResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating lead call log:', err.message);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    } finally {
        client.release();
    }
});

// Get lead call logs for a lead
app.get('/api/leads/:id/call-logs', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT t.*, u.full_name as telecaller_name 
             FROM lead_call_logs t
             JOIN users u ON t.telecaller_user_id = u.user_id
             WHERE t.lead_id = $1
             ORDER BY t.call_datetime DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching lead call logs:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get lead call logs for an account
app.get('/api/accounts/:id/call-logs', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT t.*, u.full_name as telecaller_name 
             FROM lead_call_logs t
             JOIN users u ON t.telecaller_user_id = u.user_id
             WHERE t.account_id = $1
             ORDER BY t.call_datetime DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching account call logs:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// ACCOUNT MEETINGS API
// ==========================================

// Log a meeting
app.post('/api/meetings', async (req, res) => {
    const {
        lead_id, account_id, meeting_type, meeting_mode,
        meeting_date, meeting_time, meeting_city, meeting_address,
        internal_attendees, customer_attendees, meeting_notes, meeting_status
    } = req.body;

    if (!lead_id || !account_id || !meeting_mode || !meeting_date || !meeting_time) {
        return res.status(400).json({ error: 'Missing required meeting fields' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO account_meetings (
                lead_id, account_id, meeting_type, meeting_mode,
                meeting_date, meeting_time, meeting_city, meeting_address,
                internal_attendees, customer_attendees, meeting_notes, meeting_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
                lead_id, account_id, meeting_type || 'Initial Connect', meeting_mode,
                meeting_date, meeting_time, meeting_city || null, meeting_address || null,
                internal_attendees, customer_attendees, meeting_notes, meeting_status || 'Scheduled'
            ]
        );

        // Update lead state
        await client.query(
            'UPDATE leads SET last_contacted_at = NOW() WHERE lead_id = $1',
            [lead_id]
        );

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating meeting:', err.message);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    } finally {
        client.release();
    }
});

// Get meetings for a lead
app.get('/api/leads/:id/meetings', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT m.*, c.city_name 
             FROM account_meetings m
             LEFT JOIN city_master c ON m.meeting_city = c.city_id
             WHERE m.lead_id = $1
             ORDER BY m.meeting_date DESC, m.meeting_time DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching lead meetings:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all meetings
app.get('/api/meetings', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.*, a.account_name, a.primary_contact_name as contact_name, a.contact_phone, a.contact_email, c.city_name 
             FROM account_meetings m
             LEFT JOIN accounts a ON m.account_id = a.account_id
             LEFT JOIN leads l ON m.lead_id = l.lead_id
             LEFT JOIN city_master c ON m.meeting_city = c.city_id
             ORDER BY m.meeting_date DESC, m.meeting_time DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all meetings:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update meeting status
app.patch('/api/meetings/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid meeting status' });
    }

    try {
        const result = await pool.query(
            'UPDATE account_meetings SET meeting_status = $1 WHERE meeting_id = $2 RETURNING *',
            [status, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating meeting status:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Meeting Stats (Counts for Today, Yesterday, This Week, This Month)
app.get('/api/meetings/stats', async (req, res) => {
    try {
        const query = `
            SELECT
                COUNT(*) FILTER (WHERE meeting_date::date = CURRENT_DATE) as today,
                COUNT(*) FILTER (WHERE meeting_date::date = CURRENT_DATE - INTERVAL '1 day') as yesterday,
                COUNT(*) FILTER (WHERE meeting_date >= date_trunc('week', CURRENT_DATE)) as this_week,
                COUNT(*) FILTER (WHERE meeting_date >= date_trunc('month', CURRENT_DATE)) as this_month
            FROM account_meetings
        `;
        const result = await pool.query(query);
        const stats = result.rows[0];
        res.json({
            today: parseInt(stats.today),
            yesterday: parseInt(stats.yesterday),
            thisWeek: parseInt(stats.this_week),
            thisMonth: parseInt(stats.this_month)
        });
    } catch (err) {
        console.error('Error fetching meeting stats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reschedule meeting
app.patch('/api/meetings/:id/reschedule', async (req, res) => {
    const { id } = req.params;
    const { meeting_date, meeting_time } = req.body;

    if (!meeting_date || !meeting_time) {
        return res.status(400).json({ error: 'Meeting date and time are required' });
    }

    try {
        const query = `
            UPDATE account_meetings 
            SET meeting_date = $1, meeting_time = $2, meeting_status = 'Scheduled' 
            WHERE meeting_id = $3 
            RETURNING *
        `;
        const result = await pool.query(query, [meeting_date, meeting_time, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error rescheduling meeting:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// MASTER TABLES MANAGEMENT API
// ==========================================

const MASTER_TABLES = {
    'industry_master': { pk: 'industry_id', label: 'industry_name' },
    'lead_source_master': { pk: 'lead_source_id', label: 'lead_source_name' },
    'city_master': { pk: 'city_id', label: 'city_name' },
    'country_master': { pk: 'country_id', label: 'country_name' },
    'department_master': { pk: 'department_master_id', label: 'department_name' },
    'product_master': { pk: 'product_id', label: 'product_name' },
    'lob_use_case_master': { pk: 'use_case_id', label: 'use_case_name' },
    'industry_line_of_business': { pk: 'lob_id', label: 'lob_name' },
    'lead_stages': { pk: 'stage_id', label: 'stage_name' },
    'users': { pk: 'user_id', label: 'full_name' }
};

// Get master table data
app.get('/api/master/:table', async (req, res) => {
    const { table } = req.params;
    const config = MASTER_TABLES[table];

    if (!config) return res.status(400).json({ error: 'Unsupported master table' });

    try {
        const result = await pool.query(`SELECT * FROM ${table} ORDER BY ${config.pk} DESC`);
        res.json(result.rows);
    } catch (err) {
        console.error(`Error fetching master table ${table}:`, err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add record to master table
app.post('/api/master/:table', async (req, res) => {
    const { table } = req.params;
    const config = MASTER_TABLES[table];
    const data = req.body;

    if (!config) return res.status(400).json({ error: 'Unsupported master table' });

    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    try {
        const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(`Error adding to master table ${table}:`, err.message);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Update record in master table
app.patch('/api/master/:table/:id', async (req, res) => {
    const { table, id } = req.params;
    const config = MASTER_TABLES[table];
    const data = req.body;

    if (!config) return res.status(400).json({ error: 'Unsupported master table' });

    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

    try {
        const query = `UPDATE ${table} SET ${setClause} WHERE ${config.pk} = $${values.length + 1} RETURNING *`;
        const result = await pool.query(query, [...values, id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Record not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`Error updating master table ${table}:`, err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete record from master table
app.delete('/api/master/:table/:id', async (req, res) => {
    const { table, id } = req.params;
    const config = MASTER_TABLES[table];

    if (!config) return res.status(400).json({ error: 'Unsupported master table' });

    try {
        const result = await pool.query(`DELETE FROM ${table} WHERE ${config.pk} = $1`, [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Record not found' });
        res.json({ success: true, message: 'Record deleted' });
    } catch (err) {
        console.error(`Error deleting from master table ${table}:`, err.message);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log(`API endpoints available at http://0.0.0.0:${port}/api/leads`);
    console.log(`Access from local machine: http://localhost:${port}`);
    console.log(`Access from network: http://<your-ip>:${port}`);
});
