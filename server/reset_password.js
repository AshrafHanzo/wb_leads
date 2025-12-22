const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: '103.14.123.44',
    user: 'dhi_admin',
    port: 30018,
    database: 'wb_lead',
    password: 'dhi@123',
});

async function resetAdmin() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        try {
            console.log('Resetting admin password...');
            const adminEmail = 'jananimohan44@gmail.com';
            const adminPass = 'janani04';

            // Check if user exists
            const check = await client.query('SELECT user_id FROM users WHERE email = $1', [adminEmail]);

            if (check.rows.length > 0) {
                await client.query('UPDATE users SET password = $1 WHERE email = $2', [adminPass, adminEmail]);
                console.log('SUCCESS: Password updated to: ' + adminPass);
            } else {
                console.log('User not found. Creating new admin...');
                await client.query(
                    "INSERT INTO users (full_name, email, password, role, status) VALUES ('Janani Mohan', $1, $2, 'Admin', 'Active')",
                    [adminEmail, adminPass]
                );
                console.log('SUCCESS: Admin user created with password: ' + adminPass);
            }
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await pool.end();
    }
}

resetAdmin();
