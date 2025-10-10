const express = require('express');
const { listEvents, buyTicket } = require('../controllers/clientController');

const router = express.Router();

router.get('/events', listEvents);
router.post('/events/:id/purchase', buyTicket);

module.exports = router;
