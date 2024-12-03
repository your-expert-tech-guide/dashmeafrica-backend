const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, "hello", { expiresIn: '30d' });
};

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

    // res.status(201).json({ message: 'User registered successfully' });
    // Return token
    res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        token: generateToken(newUser._id),
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Authenticate user
// @route POST /api/users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
  
    try {
      const user = await User.findOne({ email });
  
      // Check if user exists and compare passwords
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Return token if login is successful
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

module.exports = router;
