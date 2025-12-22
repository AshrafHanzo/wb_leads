const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function addCol() {
    const client = await pool.connect();
    try {
        console.log('Adding de_assigned_to column...');
        await client.query(`
            ALTER TABLE leads 
            ADD COLUMN IF NOT EXISTS de_assigned_to integer REFERENCES users(user_id);
        `);
        console.log('Done.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

addCol();
