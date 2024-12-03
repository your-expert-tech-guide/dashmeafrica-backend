const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc Register a new user
// @route POST /api/users/register
// @access Public
router.post('/register', async (req, res) => {
  const { fullName, username, email, password, confirmPassword } = req.body;

  if (!fullName || !username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newUser = await User.create({ fullName, username, email, password });
    if (!newUser) {
      throw new Error('User registration failed');
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
