const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');       // 1. require cors
const routes = require('./routes'); // chatbot routes

const app = express();              // 2. create app instance
app.use(cors());                    // 3. enable CORS
app.use(express.json());            // 4. JSON middleware

// Path to JSON file storing events
const eventsFile = path.join(__dirname, 'events.json');

// Helper to read events
const readEvents = () => {
  try {
    return JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
  } catch (err) {
    console.error('Error reading events file:', err);
    return [];
  }
};

// Helper to write events
const writeEvents = (events) => {
  try {
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
  } catch (err) {
    console.error('Error writing events file:', err);
  }
};

// ✅ Get all events
app.get('/api/llm/events', (req, res) => {
  try {
    const events = readEvents();
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// ✅ Purchase tickets
app.post('/api/llm/events/:id/purchase', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid ticket quantity.' });
    }

    const events = readEvents();
    const event = events.find((e) => e.id === id);

    if (!event) return res.status(404).json({ error: 'Event not found.' });
    if (event.ticketsAvailable < quantity)
      return res.status(400).json({ error: `Only ${event.ticketsAvailable} tickets available.` });

    event.ticketsAvailable -= quantity;
    writeEvents(events);

    res.status(200).json({
      message: `Successfully purchased ${quantity} ticket(s) for ${event.name}.`,
      updatedEvent: event,
    });
  } catch (err) {
    console.error('Error processing purchase:', err);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// ✅ Mount chatbot routes (parse, confirm)
app.use('/api/llm', routes);

// ✅ Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(6001, () => {
  console.log(`✅ Server running on http://localhost:6001`);
});
