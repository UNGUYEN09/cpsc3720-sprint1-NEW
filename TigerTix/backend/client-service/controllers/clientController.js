const { getEvents, buyTicket } = require('../models/clientModel');

const listEvents = (req, res) => {
  getEvents((err, events) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(200).json(events);
  });
};

const buyTicketController = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  buyTicket(id, quantity, (err, updatedEvent) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json({ message: 'Tickets purchased', updatedEvent });
  });
};

module.exports = { listEvents, buyTicket: buyTicketController };
