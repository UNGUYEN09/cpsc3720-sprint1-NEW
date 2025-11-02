CREATE TABLE IF NOT EXISTS Events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  ticketsAvailable INTEGER NOT NULL
);

-- Insert a default event for testing
INSERT OR IGNORE INTO events (id, name, date, ticketsAvailable)
VALUES (1, 'Test Event', '2025-12-01', 100);