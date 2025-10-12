const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the shared database
const dbPath = path.resolve(__dirname, '../../shared-db/database.sqlite');

// Open a connection to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database:', err.message);
  } else {
    console.log('Connected to shared SQLite database');
  }
});


/*
addEvent(name, date, ticketsAvailable, callback)
PURPOSE: Adds a new event directly to the DB.
INPUTS: string name, string date, int ticketsAvailable, callback
OUTPUTS: callback
*/
const addEvent = (name, date, ticketsAvailable, callback) => {
  const query = `
    INSERT INTO Events (name, date, ticketsAvailable)
    VALUES (?, ?, ?)
  `;
  db.run(query, [name, date, ticketsAvailable], function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null, { id: this.lastID, name, date, ticketsAvailable });
    }
  });
};

/*
getEvents(callback)
PURPOSE: Fetches events from DB
INPUTS: callback
OUTPUTS: callback
*/
const getEvents = (callback) => {
  db.all('SELECT * FROM Events', [], (err, rows) => {
    if (err) {
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

module.exports = { addEvent, getEvents };
