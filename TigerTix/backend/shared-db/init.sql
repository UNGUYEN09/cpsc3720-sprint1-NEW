CREATE TABLE IF NOT EXISTS Events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  ticketsAvailable INTEGER NOT NULL
);

-- Reset table
DELETE FROM Events;

-- Initialization 
INSERT INTO Events (id, name, date, ticketsAvailable) VALUES
  (1, 'Campus Concert', '2025-12-01', 100),
  (2, 'Tiger Football Game', '2025-12-05', 100),
  (3, 'Career Fair', '2025-12-10', 100);