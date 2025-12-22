const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function checkSchema() {
    try {
        const client = await pool.connect();

        console.log('--- industry_master columns ---');
        const res1 = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'industry_master';
        `);
        console.table(res1.rows);

        console.log('\n--- lead_source_master columns ---');
        const res2 = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'lead_source_master';
        `);
        console.table(res2.rows);

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkSchema();
