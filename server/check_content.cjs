const { Pool } = require('pg');

const pool = new Pool({
    host: '103.14.123.44',
    port: 30018,
    database: 'wb_lead',
    user: 'dhi_admin',
    password: 'dhi@123',
});

async function checkContent() {
    try {
        console.log('--- DB Content Check ---');

        const tables = ['city_master', 'country_master'];
        for (const table of tables) {
            console.log(`\nTable: ${table}`);
            const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`Total rows: ${res.rows[0].count}`);

            if (parseInt(res.rows[0].count) > 0) {
                const sample = await pool.query(`SELECT * FROM ${table} LIMIT 3`);
                console.log('Sample data:', sample.rows);
            }
        }

        await pool.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkContent();
