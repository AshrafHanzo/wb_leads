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
CREATE TABLE IF NOT EXISTS telecall_logs (
    call_id SERIAL PRIMARY KEY,
    lead_id INT NOT NULL,
    account_id INT NOT NULL,
    caller_id INT NOT NULL,
    call_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    call_duration_seconds INT,
    call_outcome VARCHAR(30) NOT NULL,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    call_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tc_lead FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE,
    CONSTRAINT fk_tc_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_tc_user FOREIGN KEY (caller_id) REFERENCES users(user_id)
);
`;

async function migrate() {
    try {
        console.log('Running migration: Create telecall_logs table...');
        await pool.query(sql);
        console.log('Migration successful: telecall_logs table created.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
