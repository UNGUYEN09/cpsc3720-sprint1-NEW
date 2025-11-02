const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/clientRoutes');
const setupDB = require('./setup');

const app = express();
const PORT = 6001;

app.use(cors());
app.use(express.json());
app.use('/api', clientRoutes);

if (process.env.NODE_ENV !== 'test') {
  setupDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Client service running on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
