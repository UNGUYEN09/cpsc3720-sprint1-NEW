const express = require('express');
const cors = require('cors');  // add this
const clientRoutes = require('./routes/clientRoutes');

const app = express();
app.use(cors());               // enable CORS
app.use(express.json());
app.use('/api', clientRoutes);

const PORT = 6001;
app.listen(PORT, () => {
  console.log(`Client service running on http://localhost:${PORT}`);
});
