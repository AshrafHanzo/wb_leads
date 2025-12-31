const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function createTable() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();

        console.log('Creating product_master table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS product_master (
                product_id SERIAL PRIMARY KEY,
                product_name VARCHAR(255) NOT NULL,
                product_description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table created successfully.');

        console.log('Seeding initial data...');
        // Check if data exists first
        const check = await client.query('SELECT count(*) FROM product_master');
        if (parseInt(check.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO product_master (product_name, product_description) VALUES 
                ('Ad ROI', 'Advertising Return on Investment Solution'),
                ('BoostEntryAI', 'AI-powered Entry Booster');
            `);
            console.log('Data seeded successfully.');
        } else {
            console.log('Table already has data, skipping seed.');
        }

        console.log('Done!');
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createTable();
