require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const { jwtAuth } = require('./authMiddleware');

const app = express();
app.use(express.json());
app.use(cookieParser());

// --------------------- CORS ---------------------
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

// --------------------- DB ---------------------
const dbPath = path.resolve(__dirname, '../backend/shared-db/tigertix.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB open error:', err);
  else console.log('Auth database connected:', dbPath);
});

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);
});

// --------------------- Helpers ---------------------
function createToken(payload) {
  const expiresIn = parseInt(process.env.JWT_EXPIRES_IN || '1800', 10);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

// --------------------- Routes ---------------------

// REGISTER
app.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    stmt.run(email, hash, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'email already registered' });
        return res.status(500).json({ error: 'db error' });
      }
      return res.status(201).json({ message: 'registered', userId: this.lastID });
    });
    stmt.finalize();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  db.get('SELECT id, email, password_hash FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) return res.status(401).json({ error: 'invalid credentials' });

    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) return res.status(401).json({ error: 'invalid credentials' });

    const token = createToken({ sub: row.id, email: row.email });
    const cookieName = process.env.COOKIE_NAME || 'tigertix_auth_token';

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isProduction,                    
      sameSite: isProduction ? 'none' : 'lax', 
      maxAge: parseInt(process.env.JWT_EXPIRES_IN || '1800', 10) * 1000,
    });

    res.json({ message: 'logged in', user: { id: row.id, email: row.email } });
  });
});

// LOGOUT
app.post('/logout', (req, res) => {
  const cookieName = process.env.COOKIE_NAME || 'tigertix_auth_token';
  res.clearCookie(cookieName);
  res.json({ message: 'logged out' });
});

// PROFILE (protected)
app.get('/profile', jwtAuth, (req, res) => {
  const userId = req.user.sub;
  db.get('SELECT id, email, created_at FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) return res.status(404).json({ error: 'user not found' });
    res.json({ user: row });
  });
});

// BOOK TICKET (protected placeholder)
app.post('/book-ticket', jwtAuth, (req, res) => {
  res.json({ message: `Ticket booked by user ${req.user.email}` });
});

// --------------------- Start Server ---------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth service listening on ${PORT}`));
