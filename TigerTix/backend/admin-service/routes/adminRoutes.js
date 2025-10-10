const express = require('express');
const { createEvent } = require('../controllers/adminController');

const router = express.Router();

router.post('/events', createEvent);

module.exports = router;
