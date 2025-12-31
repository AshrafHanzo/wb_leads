const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

async function checkSchema() {
    try {
        console.log('Checking city_master...');
        const cityRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'city_master'");
        console.log('City columns:', cityRes.rows.map(r => r.column_name));

        console.log('Checking country_master...');
        const countryRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'country_master'");
        console.log('Country columns:', countryRes.rows.map(r => r.column_name));

        await pool.end();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
