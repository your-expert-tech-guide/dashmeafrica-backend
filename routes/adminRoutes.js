const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT Token
const generateToken = (id) => jwt.sign({ id }, "hello", { expiresIn: '30d' });

// Admin Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: admin._id,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Registration Route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
  
    try {
      // Check if the admin email already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin email already exists' });
      }
  
      // Create a new admin
      const admin = new Admin({ email, password });
      const savedAdmin = await admin.save();
  
      // Return a token
      res.status(201).json({
        _id: savedAdmin._id,
        email: savedAdmin.email,
        token: generateToken(savedAdmin._id),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

module.exports = router;
