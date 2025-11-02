const { addEvent, getEvents } = require('../models/adminModel');

const createEvent = (req, res) => {
  const { name, date, ticketsAvailable } = req.body;
  if (!name || !date || !ticketsAvailable) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  addEvent(name, date, ticketsAvailable, (err, newEvent) => {
    if (err) {
      console.error('Error adding event:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  });
};

const listEvents = (req, res) => {
  getEvents((err, events) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(events);
  });
};

module.exports = { createEvent, listEvents };
