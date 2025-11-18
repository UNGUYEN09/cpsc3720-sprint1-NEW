// backend/llm-driven-booking/routes.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { parseInput, bookTickets } = require('./llmService');

const eventsFile = path.join(__dirname, 'events.json');

// --- Helper to read events ---
const readEvents = () => {
  try {
    return JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
  } catch {
    return [];
  }
};

// --- LLM ROUTES ---
router.post('/parse', async (req, res) => {
  const userInput = req.body.query;
  console.log('User input:', userInput);

  try {
    const result = await parseInput(userInput);
    console.log('Parsed result:', result);
    res.json(result);
  } catch (error) {
    console.error('Llama error:', error.message);
    res.status(400).json({ error: 'Error communicating with Llama 3: ' + error.message });
  }
});

router.post('/confirm', async (req, res) => {
  const { event, tickets } = req.body;

  if (!event || !tickets)
    return res.status(400).json({ error: 'Missing event or tickets.' });

  try {
    const booking = await bookTickets(event, tickets);
    res.json({ message: booking.message, booking });
  } catch (error) {
    console.error('Booking error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- EVENT ROUTES ---
router.get('/events', (req, res) => {
  const events = readEvents();
  res.json(events);
});

// BUY TICKET ROUTE
router.post('/events/:id/purchase', (req, res) => {
  const id = parseInt(req.params.id);
  const quantity = req.body.quantity;

  const events = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
  const event = events.find(e => e.id === id);

  if (!event) return res.status(404).json({ error: 'Event not found' });

  if (event.ticketsAvailable < quantity) {
    return res.status(400).json({ error: 'Not enough tickets' });
  }

  event.ticketsAvailable -= quantity;
  fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));

  res.json({ message: `Purchased ${quantity} ticket(s) for ${event.name}` });
});

module.exports = router;