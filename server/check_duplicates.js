// check_duplicates.js
// Run this on your server: node check_duplicates.js

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
        // Check for duplicate accounts
        console.log('=== Checking for duplicate ACCOUNTS ===\n');
        const dupAccounts = await client.query(`
            SELECT MIN(account_name) as account_name, COUNT(*) as count, array_agg(account_id ORDER BY account_id) as ids
            FROM accounts
            GROUP BY LOWER(account_name)
            HAVING COUNT(*) > 1
        `);

        if (dupAccounts.rows.length === 0) {
            console.log('✅ No duplicate accounts found.\n');
        } else {
            console.log('❌ Duplicate accounts still exist:');
            dupAccounts.rows.forEach(row => {
                console.log(`   "${row.account_name}" - IDs: ${row.ids.join(', ')}`);
            });
        }

        // Check for duplicate leads (same account_id, same date)
        console.log('\n=== Checking for duplicate LEADS (same account on same date) ===\n');
        const dupLeads = await client.query(`
            SELECT a.account_name, l.account_id, DATE(l.lead_date) as lead_date, COUNT(*) as count, 
                   array_agg(l.lead_id ORDER BY l.lead_id) as lead_ids
            FROM leads l
            JOIN accounts a ON l.account_id = a.account_id
            GROUP BY a.account_name, l.account_id, DATE(l.lead_date)
            HAVING COUNT(*) > 1
            ORDER BY count DESC
        `);

        if (dupLeads.rows.length === 0) {
            console.log('✅ No duplicate leads found.\n');
        } else {
            console.log(`Found ${dupLeads.rows.length} cases of duplicate leads:\n`);
            dupLeads.rows.forEach(row => {
                console.log(`   "${row.account_name}" on ${row.lead_date} - ${row.count} leads (IDs: ${row.lead_ids.join(', ')})`);
            });
        }

        // Show the specific "AVIAN SHIPPING" leads
        console.log('\n=== AVIAN SHIPPING leads details ===\n');
        const avianLeads = await client.query(`
            SELECT l.lead_id, l.account_id, a.account_name, l.lead_date, l.lead_source
            FROM leads l
            JOIN accounts a ON l.account_id = a.account_id
            WHERE LOWER(a.account_name) LIKE '%avian%'
            ORDER BY l.lead_id
        `);

        if (avianLeads.rows.length > 0) {
            console.log('Leads for AVIAN:');
            avianLeads.rows.forEach(row => {
                console.log(`   Lead ID: ${row.lead_id}, Account ID: ${row.account_id}, Date: ${row.lead_date}, Source: ${row.lead_source}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        pool.end();
    }
}

main();
