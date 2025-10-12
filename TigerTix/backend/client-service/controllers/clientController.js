const { getEvents, purchaseTicket } = require('../models/clientModel');

/* 
listEvents(req, res)
PURPOSE: Lists all events and their related data
INPUTS: Request req
OUTPUTS: Response res 
*/
const listEvents = (req, res) => {
  getEvents((err, events) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(events);
  });
};

/* 
buyTicket(req, res)
PURPOSE: Calls purchase ticket 
INPUTS: Request req
OUTPUTS: Response res 
*/
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
