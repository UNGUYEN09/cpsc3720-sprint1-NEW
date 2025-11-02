const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../shared-db/database.sqlite');
const initPath = path.resolve(__dirname, '../shared-db/init.sql');

if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '');

module.exports = async function setupDB() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      console.log('Connected to shared SQLite database');
    });

    const initSQL = fs.readFileSync(initPath, 'utf8');

    db.exec(initSQL, (err) => {
      if (err) return reject(err);
      console.log('Database initialized successfully!');
    });

    // Insert dummy event if table is empty
    db.get('SELECT COUNT(*) AS count FROM events', (err, row) => {
      if (err) return reject(err);
      if (row.count === 0) {
        db.run(
          `INSERT INTO events (name, date, ticketsAvailable) VALUES (?, ?, ?)`,
          ['Test Event', '2025-12-01', 100],
          (err) => {
            if (err) return reject(err);
            db.close();
            resolve();
          }
        );
      } else {
        db.close();
        resolve();
      }
    });
  });
};
