const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath);

const LLAMA_URL = 'http://localhost:11434/api/generate';

// --- Helper: get all events ---
function getEvents() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM Events", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// --- Helper: get event by name ---
function getEventByName(name) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM Events WHERE lower(name) = lower(?)",
      [name],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

// --- Helper: update ticket count ---
function updateEventTickets(id, newAmount) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE Events SET ticketsAvailable = ? WHERE id = ?",
      [newAmount, id],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// --- LLM PARSING ---
async function parseInput(query) {
  const response = await fetch(LLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt: `
You are an assistant that extracts event booking info.
From this message: "${query}", find:
1. The exact event name.
2. Number of tickets.
Respond only in JSON like:
{"event": "Event Name", "tickets": number}
`
    }),
  });

  const text = await response.text();
  const lines = text.trim().split("\n");
  let parsed = {};

  try {
    parsed = JSON.parse(lines[lines.length - 1]);
  } catch {
    console.error("Invalid response:", text);
  }

  // fallback logic
  const Events = await getEvents();
  if (!parsed.event) {
    const match = Events.find(e =>
      query.toLowerCase().includes(e.name.toLowerCase())
    );
    if (match) parsed.event = match.name;
  }

  if (!parsed.tickets || isNaN(parsed.tickets)) {
    const match = query.match(/\b\d+\b/);
    parsed.tickets = match ? parseInt(match[0]) : 1;
  }

  return {
    event: parsed.event || "unknown",
    tickets: parsed.tickets || 1,
  };
}

// --- BOOKING FUNCTION ---
async function bookTickets(eventName, tickets) {
  const event = await getEventByName(eventName);
  if (!event) throw new Error("Event not found.");
  if (event.ticketsAvailable < tickets)
    throw new Error(
      `Only ${event.ticketsAvailable} tickets available for ${event.name}.`
    );

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
  getEvents, // exporting for routes.js
};
