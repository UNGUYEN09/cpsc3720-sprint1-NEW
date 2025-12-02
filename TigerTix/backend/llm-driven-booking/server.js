// backend/llm-driven-booking/server.js
require('dotenv').config();                      

const express = require('express');
const cors = require('cors');
const routes = require('./routes'); // chatbot routes

const app = express();

const PORT = process.env.PORT || 6001;          

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

app.use(express.json());
app.use('/api/llm', routes);

// Only start server if not testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`LLM service running on http://localhost:${PORT}`);
  });
}

module.exports = app;
