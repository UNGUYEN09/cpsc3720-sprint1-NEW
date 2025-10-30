const express = require('express');
const router = express.Router();
const { parseInput, bookTickets } = require('./llmService');
const { events } = require('./routesData');

// --- LLM ROUTES ---
router.post('/parse', async (req, res) => {
    console.log('Parse route hit with body:', req.body);
    const userInput = req.body.query;

    try {
        const result = await parseInput(userInput);
        console.log('Parse result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error parsing input:', error.message);
        res.status(400).json({ error: 'Error communicating with Llama 3: ' + error.message });
    }
});

router.post('/confirm', async (req, res) => {
    console.log('Confirm route hit with body:', req.body);
    const { event, tickets } = req.body;

    if (!event || !tickets) {
        return res.status(400).json({ error: 'Missing event or tickets in request' });
    }

    try {
        const booking = await bookTickets(event, tickets);
        console.log('Booking successful:', booking);
        res.json({
            message: `Booking confirmed for ${tickets} ticket(s) to ${event}!`,
            booking,
        });
    } catch (error) {
        console.error('Error during booking:', error.message);
        res.status(500).json({ error: 'Error booking tickets: ' + error.message });
    }
});

// --- EVENT ROUTES ---
router.get('/events', (req, res) => {
    res.json(events);
});

router.post('/events/:id/purchase', (req, res) => {
    const eventId = parseInt(req.params.id);
    const event = events.find((e) => e.id === eventId);

    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.ticketsAvailable > 0) {
        event.ticketsAvailable--;
        res.json({ message: `Ticket purchased for ${event.name}` });
    } else {
        res.status(400).json({ error: 'No tickets available' });
    }
});

module.exports = router;
