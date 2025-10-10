const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the shared database
const dbPath = path.join(__dirname, '../../shared-db/database.sqlite');

// Open a connection to the shared DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database:', err.message);
  } else {
    console.log('Client-service connected to shared SQLite database');
  }
});

// Fetch all events
const getEvents = (callback) => {
  db.all('SELECT * FROM Events', [], (err, rows) => {
    if (err) {
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

// Simulate ticket purchase
const purchaseTicket = (id, callback) => {
  db.run(
    `UPDATE Events 
     SET ticketsAvailable = ticketsAvailable - 1 
     WHERE id = ? AND ticketsAvailable > 0`,
    [id],
    function (err) {
      if (err) return callback(err);
      if (this.changes === 0) {
        // No rows updated → tickets sold out or invalid ID
        return callback(new Error('No tickets available or invalid event ID'));
      }
      callback(null);
    }
  );
};

module.exports = { getEvents, purchaseTicket };
