const { getEvents, purchaseTicket } = require('../models/clientModel');

const listEvents = (req, res) => {
  getEvents((err, events) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(events);
  });
};

const buyTicket = (req, res) => {
  const eventId = req.params.id;

  purchaseTicket(eventId, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Ticket purchased successfully!' });
  });
};

module.exports = { listEvents, buyTicket };
