const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

const sql = `
-- Create lead_call_logs table
CREATE TABLE IF NOT EXISTS lead_call_logs (
    call_id SERIAL PRIMARY KEY,
    lead_id INT NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
    account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    telecaller_user_id INT NOT NULL REFERENCES users(user_id),
    call_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    call_duration_seconds INT DEFAULT 0,
    call_outcome VARCHAR(50) NOT NULL,
    notes TEXT,
    followup_required BOOLEAN DEFAULT false,
    followup_datetime TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update leads table with state columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='leads' AND COLUMN_NAME='last_contacted_at') THEN
        ALTER TABLE leads ADD COLUMN last_contacted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='leads' AND COLUMN_NAME='next_followup_at') THEN
        ALTER TABLE leads ADD COLUMN next_followup_at TIMESTAMP;
    END IF;
END $$;

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON lead_call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_account_id ON lead_call_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_followup_at);
`;

async function migrate() {
    try {
        console.log('Running migration: Robust Telecall Logs...');
        await pool.query(sql);
        console.log('Migration successful: lead_call_logs created and leads table updated.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
