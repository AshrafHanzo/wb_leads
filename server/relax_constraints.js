const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.14.123.44',
    port: process.env.DB_PORT || 30018,
    database: process.env.DB_NAME || 'wb_lead',
    user: process.env.DB_USER || 'dhi_admin',
    password: process.env.DB_PASSWORD || 'dhi@123',
});

const tablesToFix = [
    { table: 'department_master', pk: 'department_master_id' },
    { table: 'lob_use_case_master', pk: 'use_case_id' },
    { table: 'users', pk: 'user_id' },
    { table: 'lead_stages', pk: 'stage_id' }
];

async function fixSerial(table, pk) {
    console.log(`Checking ${table}.${pk}...`);
    try {
        const seqName = `${table}_${pk}_seq`;

        // 1. Create sequence if it doesn't exist
        await pool.query(`CREATE SEQUENCE IF NOT EXISTS ${seqName}`);

        // 2. Set the sequence to the current max ID + 1
        const maxResult = await pool.query(`SELECT COALESCE(MAX(${pk}), 0) + 1 as next_id FROM ${table}`);
        const nextId = maxResult.rows[0].next_id;
        await pool.query(`SELECT setval('${seqName}', ${nextId}, false)`);

        // 3. Set the column default
        await pool.query(`ALTER TABLE ${table} ALTER COLUMN ${pk} SET DEFAULT nextval('${seqName}')`);

        console.log(`Fixed ${table}: Sequence created and default set to nextval.`);
    } catch (err) {
        console.error(`Error fixing ${table}:`, err.message);
    }
}

async function migrate() {
    try {
        console.log('Starting comprehensive master table fix...');

        for (const t of tablesToFix) {
            await fixSerial(t.table, t.pk);
        }

        // Relax other constraints again just in case
        await pool.query('ALTER TABLE city_master ALTER COLUMN state_id DROP NOT NULL');
        await pool.query('ALTER TABLE industry_line_of_business ALTER COLUMN industry_id DROP NOT NULL');
        await pool.query('ALTER TABLE lob_use_case_master ALTER COLUMN lob_id DROP NOT NULL');
        await pool.query('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
        await pool.query('ALTER TABLE users ALTER COLUMN password DROP NOT NULL');
        await pool.query('ALTER TABLE users ALTER COLUMN role SET DEFAULT \'User\'');
        await pool.query('ALTER TABLE users ALTER COLUMN status SET DEFAULT \'Active\'');

        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
