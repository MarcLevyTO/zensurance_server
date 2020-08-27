const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const auth = require('..//middleware/auth');

// User Model
const User = require('../models/User');

// @route     POST /users
// @desc      Register new user
// @access    Public
// @params    email, password, currency
router.post('/', (req, res) => {
  const { email, password, currency } = req.body;

  if (!email || !password || !currency) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Check for existing user
  User.findOne({ email }).then(user => {
    if (user) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({
      email,
      password,
      currency,
    });

    // Create salt & hash
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then((user, err) => {
          if (err) res.status(500).send({ err });

          jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (tokenError, token) => {
              if (tokenError) res.status(500).send({ tokenError });
              res.json({
                token,
                user: {
                  id: user.id,
                  email: user.email,
                  currency: user.currency,
                },
              });
            }
          );
        });
      });
    });
  });
});

// @route     PUT /users/:id
// @desc      Update user fields (email, currency)
// @access    Private
// @note      Does not include updating the users password
// @params    email, currency
router.put('/:id', auth, (req, res) => {
  const { email, currency } = req.body;

  if (!email || !currency) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  User.find({ email }).then(users => {
    if (users.length === 0) {
      const { user } = req;
      user.email = email;
      user.currency = currency;
      user.save().then((user, err) => {
        if (err) res.status(500).send({ err });
        res.json({ user });
      });
    } else {
      return res.status(400).json({ message: 'User name or email taken' });
    }
  });
});

// @route     PUT /users/:id/updatePassword
// @desc      Update user password
// @access    Private
// @params    oldPassword, newPassword
router.put('/:id/updatePassword', auth, (req, res) => {
  const { newPassword, oldPassword } = req.body;

  if (!newPassword || !oldPassword) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const _id = req.params.id;
  User.findOne({ _id }).then(user => {
    if (!user) return res.status(400).json({ message: 'User does not exist' });

    bcrypt.compare(oldPassword, user.password).then(isMatch => {
      if (!isMatch)
        return res.status(400).json({ message: 'Invalid credentials' });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newPassword, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          user.save().then((user, err) => {
            if (err) res.status(500).send({ err });
            jwt.sign(
              { id: user.id },
              process.env.JWT_SECRET,
              { expiresIn: 3600 },
              (err, token) => {
                if (err) throw err;
                res.json({
                  token,
                  user: {
                    id: user.id,
                    email: user.email,
                    currency: user.currency,
                  },
                });
              }
            );
          });
        });
      });
    });
  });
});

module.exports = router;
