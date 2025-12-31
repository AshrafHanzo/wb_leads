// delete_duplicate_leads.js
// Deletes duplicate leads (same account on same date), keeps the older lead_id

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function main() {
    const client = await pool.connect();

    try {
        console.log('=== Finding duplicate leads (same account on same date) ===\n');

        // Find duplicate leads
        const dupLeads = await client.query(`
            SELECT account_id, DATE(lead_date) as lead_date, 
                   array_agg(lead_id ORDER BY lead_id) as lead_ids
            FROM leads
            GROUP BY account_id, DATE(lead_date)
            HAVING COUNT(*) > 1
        `);

        if (dupLeads.rows.length === 0) {
            console.log('✅ No duplicate leads found.\n');
            return;
        }

        console.log(`Found ${dupLeads.rows.length} cases of duplicate leads.\n`);

        // Collect all lead_ids to delete (all except the first/oldest one)
        const leadsToDelete = [];
        dupLeads.rows.forEach(row => {
            // Keep the first (oldest) lead_id, delete the rest
            const idsToDelete = row.lead_ids.slice(1);
            leadsToDelete.push(...idsToDelete);
        });

        console.log(`Will delete ${leadsToDelete.length} duplicate leads.\n`);
        console.log('Lead IDs to delete:', leadsToDelete.join(', '));

        if (leadsToDelete.length === 0) {
            return;
        }

        // Delete related data first
        const idsString = leadsToDelete.join(',');

        console.log('\n=== Deleting related data ===\n');

        // Delete from lead_call_logs if exists
        try {
            await client.query('BEGIN');
            const r1 = await client.query(`DELETE FROM lead_call_logs WHERE lead_id IN (${idsString})`);
            await client.query('COMMIT');
            console.log(`  - Removed ${r1.rowCount} call logs`);
        } catch (e) {
            await client.query('ROLLBACK');
            console.log('  - Skipped call logs');
        }

        // Delete from meetings if linked to lead
        try {
            await client.query('BEGIN');
            const r2 = await client.query(`DELETE FROM meetings WHERE lead_id IN (${idsString})`);
            await client.query('COMMIT');
            console.log(`  - Removed ${r2.rowCount} meetings`);
        } catch (e) {
            await client.query('ROLLBACK');
            console.log('  - Skipped meetings');
        }

        // Delete the duplicate leads
        console.log('\n=== Deleting duplicate leads ===\n');

        await client.query('BEGIN');
        const deleteResult = await client.query(`DELETE FROM leads WHERE lead_id IN (${idsString})`);
        await client.query('COMMIT');

        console.log(`✅ Deleted ${deleteResult.rowCount} duplicate leads.`);
        console.log('\n🎉 Done! Your database is now clean of duplicate leads.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        pool.end();
    }
}

main();
