const fetch = require('node-fetch');

async function testEndpoints() {
    try {
        const userInput = 'I want to buy a ticket to the Campus Concert';

        // 1️⃣ Test /parse
        const parseRes = await fetch('http://localhost:6001/api/llm/parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: userInput }),
        });

        const parseData = await parseRes.json();
        console.log('Parse Response:', parseData);

        if (!parseRes.ok) {
            console.error('Parse failed:', parseData.error);
            return;
        }

        // 2️⃣ Test /confirm
        const confirmRes = await fetch('http://localhost:6001/api/llm/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: parseData.event, tickets: parseData.tickets }),
        });

        const confirmData = await confirmRes.json();
        console.log('Confirm Response:', confirmData);

    } catch (err) {
        console.error('Error during test:', err.message);
    }
}

testEndpoints();
