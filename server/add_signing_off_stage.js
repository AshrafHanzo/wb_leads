const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function addSigningOffStage() {
    try {
        const client = await pool.connect();

        // Add Signing Off stage (stage_id 12)
        await client.query(`
            INSERT INTO lead_stages (stage_id, stage_name) 
            VALUES (12, 'Signing Off') 
            ON CONFLICT (stage_id) DO UPDATE SET stage_name = 'Signing Off'
        `);
        console.log('Signing Off stage added/updated successfully');

        // Show all stages
        const result = await client.query('SELECT * FROM lead_stages ORDER BY stage_id');
        console.log('Current stages:');
        console.table(result.rows);

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

addSigningOffStage();
