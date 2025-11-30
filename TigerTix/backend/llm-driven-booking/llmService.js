const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// dynamic import for node-fetch
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const dbPath = path.join(__dirname, '../shared-db/database.sqlite');

// configurablility 
const LLAMA_URL = process.env.LLAMA_URL || 'http://localhost:11434/api/generate'; 
const USE_OLLAMA = process.env.USE_OLLAMA === 'true'; 

// -------------------- DB HELPERS --------------------

function getEvents() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    db.all('SELECT * FROM Events', [], (err, rows) => {
      db.close();
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getEventByName(name) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    db.get(
      'SELECT * FROM Events WHERE lower(name) = lower(?)',
      [name],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      }
    );
  });
}

function updateEventTickets(id, newAmount) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    db.run(
      'UPDATE Events SET ticketsAvailable = ? WHERE id = ?',
      [newAmount, id],
      function (err) {
        db.close();
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

// -------------------- SIMPLE FALLBACK PARSER --------------------

// basic rule-based parser used when Ollama is disabled or fails
async function simpleParse(query, events) {
  // tickets: first number in the string, or default to 1
  const numMatch = query.match(/\b\d+\b/);
  const tickets = numMatch ? parseInt(numMatch[0], 10) : 1;

  // event: first event whose name appears in the query text
  let eventName = 'unknown';
  const lowerQuery = query.toLowerCase();

  for (const ev of events) {
    if (lowerQuery.includes(ev.name.toLowerCase())) {
      eventName = ev.name;
      break;
    }
  }

  return { event: eventName, tickets };
}

// -------------------- LLM PARSING --------------------
async function parseInput(query) {
  const events = await getEvents();

  // Try Ollama only if enabled
  if (USE_OLLAMA) {
    try {
      const response = await fetch(LLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: `
You are an assistant that extracts event booking info.
From this message: "${query}", find:
1. The event name (exactly as written in our list if possible).
2. The number of tickets.

Respond ONLY in JSON like:
{"event": "Event Name", "tickets": number}
          `,
        }),
      });

      const text = await response.text();
      const lines = text.trim().split('\n');
      const lastLine = lines[lines.length - 1];

      let parsed = {};
      try {
        parsed = JSON.parse(lastLine);
      } catch (e) {
        console.error('Invalid JSON from Llama, raw text:', text);
      }

      // use DB events to fill missing/unknown event name
      if (!parsed.event || parsed.event === 'unknown') {
        const lowerQuery = query.toLowerCase();
        const match = events.find((e) =>
          lowerQuery.includes(e.name.toLowerCase())
        );
        if (match) parsed.event = match.name;
      }

      if (!parsed.tickets || isNaN(parsed.tickets)) {
        const matchNum = query.match(/\b\d+\b/);
        parsed.tickets = matchNum ? parseInt(matchNum[0], 10) : 1;
      }

      return {
        event: parsed.event || 'unknown',
        tickets: parsed.tickets || 1,
      };
    } catch (err) {
      console.error('Error communicating with Llama, falling back:', err.message);
      // fall through to simpleParse
    }
  }

  // Fallback if USE_OLLAMA is false OR Ollama call failed
  return simpleParse(query, events);
}

// -------------------- BOOKING FUNCTION --------------------

async function bookTickets(eventName, tickets) {
  const event = await getEventByName(eventName);
  if (!event) throw new Error('Event not found.');

  if (event.ticketsAvailable < tickets) {
    throw new Error(
      `Only ${event.ticketsAvailable} tickets available for ${event.name}.`
    );
  }

  const newAmount = event.ticketsAvailable - tickets;
  await updateEventTickets(event.id, newAmount);

  return {
    event: event.name,
    tickets,
    message: `Successfully booked ${tickets} ticket(s) for ${event.name}.`,
  };
}

module.exports = {
  parseInput,
  bookTickets,
  getEvents,
};
