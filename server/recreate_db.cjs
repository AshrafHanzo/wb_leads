const { Pool } = require('pg');
const pool = new Pool({
    host: '103.14.123.44',
    port: 30018,
    database: 'wb_lead',
    user: 'dhi_admin',
    password: 'dhi@123',
});

const schema = `
-- Drop existing if they have wrong schema and are empty
DROP TABLE IF EXISTS department_pain_points CASCADE;
DROP TABLE IF EXISTS account_use_cases CASCADE;
DROP TABLE IF EXISTS account_departments CASCADE;
DROP TABLE IF EXISTS account_line_of_business CASCADE;
DROP TABLE IF EXISTS account_contacts CASCADE;

-- Account Contacts
CREATE TABLE account_contacts (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(account_id),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account Line of Business
CREATE TABLE account_line_of_business (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(account_id),
    business_type VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account Departments
CREATE TABLE account_departments (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(account_id),
    department_name VARCHAR(255) NOT NULL,
    head_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account Use Cases
CREATE TABLE account_use_cases (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(account_id),
    use_case_title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Identified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Department Pain Points
CREATE TABLE department_pain_points (
    id SERIAL PRIMARY KEY,
    department_id INTEGER REFERENCES account_departments(id),
    pain_point TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'Medium',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function recreate() {
    try {
        console.log('Starting database recreation for sub-entities...');
        await pool.query(schema);
        console.log('Database tables recreated successfully!');
    } catch (err) {
        console.error('Error recreating database tables:', err);
    } finally {
        await pool.end();
    }
}

recreate();
