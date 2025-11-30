require('dotenv').config();                   

const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/clientRoutes');
const setupDB = require('./setup');

const app = express();

const PORT = process.env.PORT || 6001;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

app.use(express.json());
app.use('/api', clientRoutes);

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  setupDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Client service running on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
