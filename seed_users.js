const fetch = require('node-fetch'); // or just global fetch in newer node

async function seed() {
    try {
        console.log('Seeding BD User...');
        const res1 = await fetch('http://localhost:3001/api/users/3', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                full_name: "Thasalem",
                email: "bd@workbooster.com",
                role: "BD",
                phone: "9876543210",
                status: "Active",
                password: "password123"
            })
        });
        const data1 = await res1.json();
        console.log('BD Update:', data1);

        console.log('Creating Telecaller User...');
        // First check if exists or just try creating
        const res2 = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                full_name: "Test Telecaller",
                email: "telecaller@workbooster.com",
                role: "Telecaller",
                phone: "1234567890",
                status: "Active",
                password: "password123"
            })
        });
        const data2 = await res2.json();
        console.log('Telecaller Create:', data2);

    } catch (e) {
        console.error(e);
    }
}
seed();
