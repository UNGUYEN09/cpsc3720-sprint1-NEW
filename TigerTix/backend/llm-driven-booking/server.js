const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// All API routes under /api/llm
app.use('/api/llm', routes);

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => {
    console.log(`LLM-driven Booking Service running on port ${PORT}`);
});
