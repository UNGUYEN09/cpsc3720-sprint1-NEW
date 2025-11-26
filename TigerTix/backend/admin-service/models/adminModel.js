const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../shared-db/database.sqlite');

// Add a new event
const addEvent = (name, date, ticketsAvailable, callback) => {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return callback(err);
  });

  const query = `INSERT INTO Events (name, date, ticketsAvailable) VALUES (?, ?, ?)`;
  db.run(query, [name, date, ticketsAvailable], function (err) {
    db.close();
    if (err) {
      callback(err);
    } else {
      callback(null, {
        id: this.lastID,
        name,
        date,
        ticketsAvailable,
      });
    }
  });
};

// Get all events
const getEvents = (callback) => {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return callback(err);
  });

  db.all('SELECT * FROM Events', [], (err, rows) => {
    db.close();
    if (err) {
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

module.exports = { addEvent, getEvents };
