const { Pool } = require('pg');

const pool = new Pool({
    host: '103.14.123.44',
    port: 30018,
    database: 'wb_lead',
    user: 'dhi_admin',
    password: 'dhi@123',
});

const ACCOUNT_ID = 79;

async function verify() {
    try {
        console.log('Testing Database Direct Insertion...');

        // 1. Test Contact
        const contactInsert = await pool.query(
            "INSERT INTO account_contacts (account_id, name, role) VALUES ($1, $2, $3) RETURNING *",
            [ACCOUNT_ID, 'Verify Name', 'Verify Role']
        );
        console.log('Contact Inserted:', contactInsert.rows[0]);

        // 2. Test LOB
        const lobInsert = await pool.query(
            "INSERT INTO account_line_of_business (account_id, business_type) VALUES ($1, $2) RETURNING *",
            [ACCOUNT_ID, 'Verify Business']
        );
        console.log('LOB Inserted:', lobInsert.rows[0]);

        // 3. Test Dept
        const deptInsert = await pool.query(
            "INSERT INTO account_departments (account_id, department_name) VALUES ($1, $2) RETURNING *",
            [ACCOUNT_ID, 'Verify Dept']
        );
        const deptId = deptInsert.rows[0].id;
        console.log('Dept Inserted:', deptInsert.rows[0]);

        // 4. Test Pain Point
        const ppInsert = await pool.query(
            "INSERT INTO department_pain_points (department_id, pain_point) VALUES ($1, $2) RETURNING *",
            [deptId, 'Verify Pain Point']
        );
        console.log('Pain Point Inserted:', ppInsert.rows[0]);

        // 5. Cleanup
        console.log('Cleaning up verification data...');
        await pool.query("DELETE FROM department_pain_points WHERE department_id = $1", [deptId]);
        await pool.query("DELETE FROM account_departments WHERE id = $1", [deptId]);
        await pool.query("DELETE FROM account_line_of_business WHERE id = $1", [lobInsert.rows[0].id]);
        await pool.query("DELETE FROM account_contacts WHERE id = $1", [contactInsert.rows[0].id]);

        console.log('Verification finished successfully!');
    } catch (err) {
        console.error('Verification error:', err);
    } finally {
        await pool.end();
    }
}

verify();
