const express = require('express');
const cors = require('cors');
const routes = require('./routes'); // chatbot routes

const app = express();
const PORT = 6001;

app.use(cors());
app.use(express.json());
app.use('/api/llm', routes);

// Only start server if not testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`LLM service running on http://localhost:${PORT}`);
  });
}

module.exports = app;
