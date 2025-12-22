const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function checkStages() {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT stage_id, stage_name FROM lead_stages ORDER BY stage_id');
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

checkStages();
