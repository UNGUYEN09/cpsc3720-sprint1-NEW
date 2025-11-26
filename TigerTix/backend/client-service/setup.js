const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../shared-db/database.sqlite');
const initPath = path.resolve(__dirname, '../shared-db/init.sql');

// Create empty DB file if it doesn't exist yet
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '');

module.exports = async function setupDB() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      console.log('Client-service connected to shared SQLite database');
    });

    const initSQL = fs.readFileSync(initPath, 'utf8');

    db.exec(initSQL, (err) => {
      if (err) {
        db.close();
        return reject(err);
      }
      console.log('Database initialized successfully!');
      db.close();
      resolve();
    });
  });
};