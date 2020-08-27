const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// User Model
const User = require('../models/User');

// @route     POST /auth
// @desc      Authenticate the user
// @access    Public
// @params    email, password
router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Check for existing user
  User.findOne({ email: email.toLocaleLowerCase() }).then(user => {
    if (!user) return res.status(400).json({ message: 'User does not exist' });

    // Validate password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch)
        return res.status(400).json({ message: 'Invalid credentials' });
      jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              email: user.email,
            },
          });
        }
      );
    });
  });
});

// @route     GET /auth/user
// @desc      Get user data
// @access    Private
router.get('/user', auth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
