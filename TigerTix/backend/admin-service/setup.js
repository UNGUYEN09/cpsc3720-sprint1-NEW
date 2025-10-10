const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path to shared database and SQL file
const dbPath = path.resolve(__dirname, '../shared-db/database.sqlite');
const initPath = path.resolve(__dirname, '../shared-db/init.sql');

// Ensure database file exists
if (!fs.existsSync(dbPath)) {
  console.log('Creating new database file...');
  fs.writeFileSync(dbPath, '');
}

// Open connection
const db = new sqlite3.Database(dbPath);

// Read and run init.sql
const initSQL = fs.readFileSync(initPath, 'utf8');
db.exec(initSQL, (err) => {
  if (err) {
    console.error('Error initializing database:', err.message);
  } else {
    console.log('Database initialized successfully!');
  }
  db.close();
});
