const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../shared-db/database.sqlite');

const getEvents = (callback) => {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return callback(err);
  });

  db.all('SELECT * FROM Events', [], (err, rows) => {
    db.close();
    if (err) callback(err);
    else callback(null, rows);
  });
};

const buyTicket = (id, quantity, callback) => {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return callback(err);
  });

  db.get('SELECT * FROM Events WHERE id = ?', [id], (err, event) => {
    if (err) {
      db.close();
      return callback(err);
    }
    if (!event) {
      db.close();
      return callback(null, null);
    }

    if (event.ticketsAvailable < quantity) {
      db.close();
      return callback(new Error('Not enough tickets'));
    }

    const newTickets = event.ticketsAvailable - quantity;
    db.run('UPDATE Events SET ticketsAvailable = ? WHERE id = ?', [newTickets, id], (err) => {
      db.close();
      if (err) return callback(err);
      callback(null, { ...event, ticketsAvailable: newTickets });
    });
  });
};

module.exports = { getEvents, buyTicket };
