// backend/llm-driven-booking/llmService.js
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const LLAMA_URL = 'http://localhost:11434/api/generate';
const eventsFile = path.join(__dirname, 'events.json');

// --- Helpers ---
const readEvents = () => {
  try {
    return JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
  } catch {
    return [];
  }
};

const writeEvents = (events) => {
  fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
};

// --- LLM PARSING ---
async function parseInput(query) {
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

Respond **only** in JSON like:
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
    } catch {
      console.error('⚠️ Invalid JSON from Llama, raw text:', text);
    }

    // --- Robust fallback extraction ---
    // Try to pull out event name manually if Llama response is malformed
    if (!parsed.event || parsed.event === 'unknown') {
      const events = readEvents();
      const possibleNames = events.map((e) => e.name.toLowerCase());
      const match = possibleNames.find((name) =>
        query.toLowerCase().includes(name)
      );
      if (match) {
        parsed.event = events.find((e) => e.name.toLowerCase() === match).name;
      }
    }

    if (!parsed.tickets || isNaN(parsed.tickets)) {
      const match = query.match(/\b\d+\b/);
      parsed.tickets = match ? parseInt(match[0]) : 1;
    }

    return {
      event: parsed.event || 'unknown',
      tickets: parsed.tickets || 1,
    };
  } catch (err) {
    console.error('❌ Error communicating with Llama 3:', err);
    throw new Error('Error communicating with Llama 3: ' + err.message);
  }
}

// --- BOOKING FUNCTION ---
async function bookTickets(eventName, tickets) {
  const events = readEvents();
  const event = events.find((e) => e.name.toLowerCase() === eventName.toLowerCase());

  if (!event) throw new Error('Event not found.');
  if (event.ticketsAvailable < tickets)
    throw new Error(`Only ${event.ticketsAvailable} tickets available for ${event.name}.`);

  event.ticketsAvailable -= tickets;
  writeEvents(events);

  return {
    event: event.name,
    tickets,
    message: `Successfully booked ${tickets} ticket(s) for ${event.name}.`,
  };
}

module.exports = { parseInput, bookTickets };
