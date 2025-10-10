const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
require('./setup'); // initializes the database

const app = express();
const PORT = 5001;

app.use(bodyParser.json());
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`✅ Admin service running on http://localhost:${PORT}`);
});
