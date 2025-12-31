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
        const table = 'accounts';
        console.log(`Checking schema for ${table}:`);
        const schemaRes = await pool.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
            [table]
        );
        console.log(`Columns:`);
        schemaRes.rows.forEach(r => {
            console.log(`- ${r.column_name} (${r.data_type})`);
        });
    } catch (err) {
        console.error('Error checking:', err);
    } finally {
        await pool.end();
    }
}

check();
