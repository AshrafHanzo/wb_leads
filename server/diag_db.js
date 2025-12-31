const { Pool } = require('pg');

const pool = new Pool({
    host: '103.14.123.44',
    port: 30018,
    database: 'wb_lead',
    user: 'dhi_admin',
    password: 'dhi@123',
});

async function check() {
    try {
        console.log('\nChecking calls made by User 4:');
        const calls = await pool.query(`
            SELECT 
                lc.call_id, 
                lc.lead_id, 
                l.assigned_telecaller, 
                u.full_name as assigned_to
            FROM lead_call_logs lc
            JOIN leads l ON lc.lead_id = l.lead_id
            JOIN users u ON l.assigned_telecaller = u.user_id
            WHERE lc.telecaller_user_id = 4
        `);
        console.table(calls.rows);

        console.log('\nLeads assigned to vishwa (User 2):');
        const vishwaLeads = await pool.query("SELECT lead_id, account_id FROM leads WHERE assigned_telecaller = 2");
        console.log('Vishwa assigned leads count:', vishwaLeads.rowCount);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

check();
