require('dotenv').config();
const jwt = require('jsonwebtoken');

const cookieName = process.env.COOKIE_NAME || 'tigertix_auth_token';
function jwtAuth(req, res, next) {
  // Accept token from HTTP-only cookie OR Authorization header Bearer <token>
  let token = null;
  if (req.cookies && req.cookies[cookieName]) token = req.cookies[cookieName];
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ error: 'missing token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token invalid or expired
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'token_expired' });
      }
      return res.status(401).json({ error: 'invalid_token' });
    }
    // payload available as decoded
    req.user = decoded;
    next();
  });
}

module.exports = { jwtAuth };
