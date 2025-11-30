require('dotenv').config();                

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');             
const adminRoutes = require('./routes/adminRoutes');
const setupDB = require('./setup');

const app = express();

const PORT = process.env.PORT || 5001;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

app.use(bodyParser.json());
app.use('/api/admin', adminRoutes);

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  setupDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Admin service running on http://localhost:${PORT}`);
    });
  });
}

// Export app for testing
module.exports = app;
