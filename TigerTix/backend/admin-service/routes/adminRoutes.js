const express = require('express');
const { createEvent, listEvents } = require('../controllers/adminController');

const router = express.Router();

router.post('/events', createEvent);
router.get('/events', listEvents);

module.exports = router;
