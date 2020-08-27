const jwt = require('jsonwebtoken');
const User = require('../models/User');

function auth(req, res, next) {
  const token = req.header('x-auth-token');

  // Check for token
  if (!token)
    res.status(401).json({ message: 'No token, authorization denied' });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add user from payload
    User.findById(decoded.id)
      .select('-password')
      .then(user => {
        if (user) {
          req.user = user;
          next();
        }
      });
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;
