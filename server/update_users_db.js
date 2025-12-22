const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function updateUsersSchema() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Add password column if it doesn't exist
        console.log('Adding password column...');
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN 
                    ALTER TABLE users ADD COLUMN password VARCHAR(255); 
                END IF; 
            END $$;
        `);

        // 2. Insert or Update Admin User
        console.log('Seeding admin user...');
        const adminEmail = 'jananimohan44@gmail.com';
        const adminPassword = 'janani04'; // In a real app, this should be hashed. Storing plain for this specific request.
        const adminName = 'Janani Mohan';
        const adminRole = 'Admin';

        // Check if user exists
        const checkUser = await client.query('SELECT user_id FROM users WHERE email = $1', [adminEmail]);

        if (checkUser.rows.length > 0) {
            // Update existing user
            await client.query(
                'UPDATE users SET password = $1, role = $2 WHERE email = $3',
                [adminPassword, adminRole, adminEmail]
            );
            console.log('Admin user updated.');
        } else {
            // Insert new user
            // Assuming user_id is serial or we need to find max id
            // Let's check if user_id is auto-increment or not based on schema.
            // Safe bet used in previous steps: select max(id) + 1 if not serial, but usually it's serial.
            // Let's try inserting without ID first (assuming SERIAL). If it fails, I'll retry.
            // Wait, previous users code in Users.tsx did `Math.max(...users.map(u => u.user_id)) + 1` which implies purely frontend ID generation?
            // BUT `check_users.js` showed `user_id` as INTEGER NO NULL.
            // Let's check if it has a sequence.

            // For safety, let's get a new ID just in case it's not SERIAL
            const maxIdRes = await client.query('SELECT MAX(user_id) as max_id FROM users');
            const newId = (maxIdRes.rows[0].max_id || 0) + 1;

            await client.query(
                'INSERT INTO users (user_id, full_name, email, password, role, status, created_date) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
                [newId, adminName, adminEmail, adminPassword, adminRole, 'Active']
            );
            console.log('Admin user created.');
        }

        await client.query('COMMIT');
        console.log('Database update successful.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating database:', err);
    } finally {
        client.release();
        pool.end();
    }
}

updateUsersSchema();
