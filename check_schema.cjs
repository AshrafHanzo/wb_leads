const { Pool } = require('pg');
// require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
    host: '103.14.123.44',
    port: 30018,
    database: 'wb_lead',
    user: 'dhi_admin',
    password: 'dhi@123',
});

async function checkSchema() {
    try {
        console.log('--- DB Schema Check ---');

        const tables = ['city_master', 'country_master'];
        for (const table of tables) {
            console.log(`\nTable: ${table}`);
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1 
                AND table_schema = 'public'
            `, [table]);

            if (res.rows.length === 0) {
                console.log('No columns found (or table does not exist in public schema)');
                // Try without schema restriction
                const resNoSchema = await pool.query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = $1
                `, [table]);
                console.log('Columns (any schema):', resNoSchema.rows.map(r => `${r.column_name} (${r.data_type})`));
            } else {
                console.log('Columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`));
            }
        }

        await pool.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkSchema();
