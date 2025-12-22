const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function checkUsersSchema() {
    const client = await pool.connect();
    try {
        // Get column details for users table
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('Users Table Schema:');
        console.log(JSON.stringify(result.rows, null, 2));

        // Check for existing users
        const users = await client.query('SELECT user_id, user_name, email, role FROM users');
        console.log('Existing Users:', JSON.stringify(users.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

checkUsersSchema();
