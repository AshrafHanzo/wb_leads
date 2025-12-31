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
        const tables = ['account_contacts', 'account_line_of_business', 'account_departments', 'account_use_cases', 'department_pain_points'];
        for (const table of tables) {
            console.log(`Checking columns for ${table}:`);
            const res = await pool.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
                [table]
            );
            console.log(res.rows);
            console.log('---');
        }
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        await pool.end();
    }
}

check();
