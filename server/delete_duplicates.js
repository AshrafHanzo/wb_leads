// delete_duplicates.js
// Run this on your server: node delete_duplicates.js

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function safeDelete(client, tableName, duplicateAccountIds) {
    try {
        const result = await client.query(`DELETE FROM ${tableName} WHERE account_id IN (${duplicateAccountIds})`);
        console.log(`  - Removed ${result.rowCount} from ${tableName}`);
        return true;
    } catch (e) {
        console.log(`  - Skipped ${tableName} (table doesn't exist or no account_id)`);
        return false;
    }
}

async function main() {
    const client = await pool.connect();

    try {
        console.log('=== STEP 1: Finding duplicate account names ===\n');

        // Find duplicates
        const duplicatesResult = await client.query(`
            SELECT MIN(account_name) as account_name, COUNT(*) as count, array_agg(account_id ORDER BY account_id) as duplicate_ids
            FROM accounts
            GROUP BY LOWER(account_name)
            HAVING COUNT(*) > 1
            ORDER BY count DESC
        `);

        if (duplicatesResult.rows.length === 0) {
            console.log('✅ No duplicates found! Your database is clean.');
            return;
        }

        console.log(`Found ${duplicatesResult.rows.length} duplicate account names:\n`);

        // Get list of duplicate account IDs to delete
        const idsToDelete = [];
        duplicatesResult.rows.forEach(row => {
            console.log(`  "${row.account_name}" - ${row.count} copies (IDs: ${row.duplicate_ids.join(', ')})`);
            console.log(`    → Will KEEP ID ${row.duplicate_ids[0]}, DELETE IDs: ${row.duplicate_ids.slice(1).join(', ')}`);
            idsToDelete.push(...row.duplicate_ids.slice(1));
        });

        if (idsToDelete.length === 0) {
            console.log('✅ No duplicates to delete.');
            return;
        }

        const idsString = idsToDelete.join(',');

        // Reassign leads
        console.log('\n=== STEP 2: Reassigning linked leads ===\n');
        await client.query('BEGIN');
        const updateLeadsResult = await client.query(`
            UPDATE leads 
            SET account_id = (
                SELECT MIN(a2.account_id)
                FROM accounts a2
                WHERE LOWER(a2.account_name) = LOWER(
                    (SELECT account_name FROM accounts WHERE account_id = leads.account_id)
                )
            )
            WHERE account_id IN (${idsString})
        `);
        await client.query('COMMIT');
        console.log(`✅ Reassigned ${updateLeadsResult.rowCount} leads.`);

        // Delete from related tables one by one (separate transactions)
        console.log('\n=== STEP 3: Removing related data from duplicates ===\n');

        const tables = [
            'account_contacts',
            'account_line_of_business',
            'account_departments',
            'account_use_cases'
        ];

        for (const table of tables) {
            try {
                await client.query('BEGIN');
                const result = await client.query(`DELETE FROM ${table} WHERE account_id IN (${idsString})`);
                await client.query('COMMIT');
                console.log(`  - Removed ${result.rowCount} from ${table}`);
            } catch (e) {
                await client.query('ROLLBACK');
                console.log(`  - Skipped ${table}`);
            }
        }

        // Delete duplicate accounts
        console.log('\n=== STEP 4: Deleting duplicate accounts ===\n');

        await client.query('BEGIN');
        const deleteResult = await client.query(`DELETE FROM accounts WHERE account_id IN (${idsString})`);
        await client.query('COMMIT');

        console.log(`✅ Deleted ${deleteResult.rowCount} duplicate accounts.`);
        console.log('\n🎉 Done! Your database is now clean of duplicates.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        pool.end();
    }
}

main();
