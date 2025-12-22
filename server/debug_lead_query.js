const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function run() {
    try {
        const id = 6;
        const query = `
            SELECT 
                l.*,
                a.account_name,
                a.industry,
                a.head_office,
                a.location,
                a.primary_contact_name,
                a.contact_person_role,
                a.contact_phone,
                a.contact_email,
                a.company_phone,
                u.full_name as generated_by_name,
                s.stage_name,
                st.status_name
            FROM leads l
            LEFT JOIN accounts a ON l.account_id = a.account_id
            LEFT JOIN users u ON l.lead_generated_by = u.user_id
            LEFT JOIN lead_stages s ON l.stage_id = s.stage_id
            LEFT JOIN lead_stage_status st ON l.status_id = st.status_id
            WHERE l.lead_id = $1
        `;
        const result = await pool.query(query, [id]);
        console.log('Success:', result.rows[0]);
    } catch (err) {
        console.error('FAILED:', err.message);
        console.error(err);
    } finally {
        pool.end();
    }
}

run();
