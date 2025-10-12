const { addEvent } = require('../models/adminModel');

/*
createEvent(req, res)
PURPOSE: Uses request data to call addEvent
INPUTS: Request req, Response res
OUTPUTS: Reponse res
*/
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

module.exports = { createEvent };
