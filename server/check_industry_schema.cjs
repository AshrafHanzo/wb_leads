const { Pool } = require('pg');

const pool = new Pool({
    host: '103.14.123.44',
    port: 30018,
    database: 'wb_lead',
    user: 'dhi_admin',
    password: 'dhi@123',
});

async function checkSchema() {
    try {
        console.log('--- Industry Master Schema Check ---');
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'industry_master' 
            AND table_schema = 'public'
        `);
        console.log('Columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`));
        await pool.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkSchema();
