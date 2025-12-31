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
-- Create account_meetings table
CREATE TABLE IF NOT EXISTS account_meetings (
    meeting_id SERIAL PRIMARY KEY,

    -- Linking
    lead_id INT NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
    account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,

    -- Meeting details
    meeting_type VARCHAR(50) DEFAULT 'Initial Connect',  -- Initial / Demo / Review
    meeting_mode VARCHAR(20) NOT NULL,                   -- Online / In-Person

    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,

    -- Location (only for in-person)
    meeting_city INT REFERENCES city_master(city_id),    -- FK to city_master
    meeting_address TEXT,

    -- Participants
    internal_attendees TEXT,    -- e.g. "Senthil, Janani"
    customer_attendees TEXT,    -- e.g. "Operations Head, Finance Head"

    meeting_notes TEXT,
    meeting_status VARCHAR(20) DEFAULT 'Scheduled',      -- Scheduled / Completed / Cancelled

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_meetings_lead_id ON account_meetings(lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_account_id ON account_meetings(account_id);
`;

async function migrate() {
    try {
        console.log('Running migration: Account Meetings...');
        await pool.query(sql);
        console.log('Migration successful: account_meetings created.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
