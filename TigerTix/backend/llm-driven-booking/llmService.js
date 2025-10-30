const { spawn } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { events } = require('./routesData'); // shared events

const DB_PATH = path.join(__dirname, '../shared-db/database.sqlite');

/**
 * parseInput(userInput)
 * Uses Ollama (Llama 3) locally to extract the event name and ticket count from user input.
 * Expects a strict JSON response like: {"event": "Event Name", "tickets": 2}
 */
async function parseInput(userInput) {
    return new Promise((resolve, reject) => {
        const command = 'ollama';
        const args = [
            'run',
            'llama3',
            `Extract the event name and number of tickets from this user request. Reply ONLY in strict JSON format like {"event": "Event Name", "tickets": 2}. User request: "${userInput}"`
        ];

        const ollama = spawn(command, args);
        let output = '';
        let errorOutput = '';

        // Collect standard output
        ollama.stdout.on('data', (data) => {
            output += data.toString();
        });

        // Collect error output
        ollama.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        // Handle process exit
        ollama.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Ollama exited with code ${code}: ${errorOutput}`));
            }

            try {
                const parsed = JSON.parse(output.trim());
                parsed.tickets = parsed.tickets || 1;
                resolve(parsed);
            } catch (err) {
                reject(new Error('Invalid JSON from Llama 3: ' + output));
            }
        });

        // Handle spawn errors
        ollama.on('error', (err) => {
            reject(new Error('Failed to start Ollama process: ' + err.message));
        });
    });
}

/**
 * bookTickets(event, tickets)
 * Saves a booking to the shared SQLite database and updates in-memory event list.
 */
async function bookTickets(event, tickets) {
    const db = new sqlite3.Database(DB_PATH);

    const bookingData = await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            const stmt = db.prepare('INSERT INTO bookings (event, tickets) VALUES (?, ?)');
            stmt.run(event, tickets, function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    return reject(err);
                }
                stmt.finalize();
                db.run('COMMIT');
                resolve({ id: this.lastID, event, tickets });
            });
        });
        db.close();
    });

    // Update in-memory events
    const targetEvent = events.find(e => e.name.toLowerCase() === event.toLowerCase());
    if (targetEvent) {
        targetEvent.ticketsAvailable = Math.max(0, targetEvent.ticketsAvailable - tickets);
    }

    return {
        ...bookingData,
        remainingTickets: targetEvent ? targetEvent.ticketsAvailable : 'N/A',
    };
}

module.exports = { parseInput, bookTickets };
