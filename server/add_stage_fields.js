const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function addStageFields() {
    const client = await pool.connect();

    try {
        console.log('Starting database migration...');

        // Create product master table first
        console.log('Creating product_master table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS product_master (
                product_id SERIAL PRIMARY KEY,
                product_name VARCHAR(255) NOT NULL UNIQUE,
                product_description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_date TIMESTAMP DEFAULT NOW()
            )
        `);

        // Insert default products
        console.log('Inserting default products...');
        await client.query(`
            INSERT INTO product_master (product_name, product_description) 
            VALUES 
                ('Product A', 'Default product A'),
                ('Product B', 'Default product B'),
                ('Product C', 'Default product C')
            ON CONFLICT (product_name) DO NOTHING
        `);

        // Add columns to leads table
        console.log('Adding new columns to leads table...');

        const alterStatements = [
            // Product Qualification
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS selected_products TEXT`,

            // Telecalling fields (some may already exist in accounts, but adding to leads for stage-specific data)
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS tc_company_website VARCHAR(500)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS tc_company_phone VARCHAR(50)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS tc_contact_person VARCHAR(255)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS tc_contact_person_phone VARCHAR(50)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS tc_location VARCHAR(500)`,

            // Initial Connect fields
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS ic_schedule_date DATE`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS ic_schedule_time TIME`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS ic_meeting_type VARCHAR(50)`, // 'In-person' or 'Google Meet'
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS ic_location VARCHAR(500)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS ic_contact_person_details TEXT`,

            // Demo fields
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_schedule_date DATE`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_schedule_time TIME`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_meeting_type VARCHAR(50)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_location VARCHAR(500)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_contact_person_details TEXT`,

            // Discovery fields
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS discovery_schedule_date DATE`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS discovery_schedule_time TIME`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS discovery_meeting_type VARCHAR(50)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS discovery_location VARCHAR(500)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS discovery_contact_person_details TEXT`,

            // POC fields
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS poc_use_case TEXT`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS poc_start_date DATE`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS poc_end_date DATE`,

            // Proposal fields
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_solution_description TEXT`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_amount DECIMAL(15, 2)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_details TEXT`,

            // Won fields
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS won_go_live_date DATE`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS won_amount DECIMAL(15, 2)`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS won_details TEXT`
        ];

        for (const statement of alterStatements) {
            try {
                await client.query(statement);
                console.log('✓', statement.substring(0, 80) + '...');
            } catch (err) {
                console.log('⚠', statement.substring(0, 80) + '...', err.message);
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('New fields added to leads table for all stages.');

    } catch (err) {
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

addStageFields().catch(console.error);
