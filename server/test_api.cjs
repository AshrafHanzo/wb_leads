const http = require('http');

async function testAPI() {
    const endpoints = [
        '/api/leads/industry-lobs'
    ];

    for (const endpoint of endpoints) {
        console.log(`\nTesting ${endpoint}...`);
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: endpoint,
            method: 'GET'
        };

        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                try {
                    const json = JSON.parse(data);
                    console.log(`Received ${json.length} items`);
                    if (json.length > 0) {
                        console.log('Sample LOB:', json[0]);
                        const logisticsLobs = json.filter(l => l.industry_name === 'Logistics');
                        console.log(`Found ${logisticsLobs.length} LOBs for 'Logistics'`);
                    }
                } catch (e) {
                    console.log('Raw response:', data);
                }
            });
        });

        req.on('error', error => console.error(`Error: ${error.message}`));
        req.end();
    }
}

testAPI();
