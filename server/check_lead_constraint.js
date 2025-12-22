const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function checkLeadsConstraints() {
    try {
        const client = await pool.connect();

        console.log('--- matches for leads_lead_source_check ---');
        const res = await client.query(`
            SELECT conname, pg_get_constraintdef(oid) as condef
            FROM pg_constraint
            WHERE conrelid = 'leads'::regclass
            AND conname = 'leads_lead_source_check';
        `);
        console.table(res.rows);

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkLeadsConstraints();
