const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ReservedAccount = require('../models/ReservedAccount');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');


// Generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, "hello", { expiresIn: '30d' });
};

// Function to get Monnify Bearer Token   sjsjsjjsjsjjs
const getMonnifyToken = async () => {
  const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
  const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
  const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';


  try {
    const credentials = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/auth/login`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64Credentials}`,
        },
      }
    );
    return response.data.responseBody.accessToken;
  } catch (error) {
    console.error('Error fetching Monnify token:', error.message);
    throw new Error('Failed to fetch Monnify token');
  }
};


// User registration with Monnify reserved account creation
// @desc Register a new user
// @route POST /api/users/register
router.post('/register', async (req, res) => {
  const { fullName, username, email, password } = req.body;

  // Validate input
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields.' });
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists.' });
  }


  const newUser = new User({
    fullName,
    username,
    email,
    password,
  });

  try {
    // Create new user
    const savedUser = await newUser.save();

    // console.log(savedUser)

    // Create Monnify reserved account
    const token = await getMonnifyToken();
    const accountReference = `REF-${Date.now()}`;
    const accountName = fullName;

    const requestData = {
      accountReference,
      accountName,
      currencyCode: 'NGN',
      contractCode: process.env.MONNIFY_CONTRACT_CODE,
      customerEmail: email,
      customerName: fullName,
      getAllAvailableBanks: true,
    };
    console.log(requestData)

    console.log(process.env.MONNIFY_BASE_URL)
    console.log(token)

    try {
      // Create a Customer Reserved Account
      const response = await axios.post(
        `${process.env.MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(response)

      const reservedAccountDetails = response.data.responseBody;


      // Save reserved account details to database
      const newReservedAccount = new ReservedAccount({
        accountReference: reservedAccountDetails.accountReference,
        accountName: reservedAccountDetails.accountName,
        customerEmail: reservedAccountDetails.customerEmail,
        customerName: reservedAccountDetails.customerName,
        accounts: reservedAccountDetails.accounts,
        balance: 0, // Initialize with 0 balance
        userId: savedUser._id, // Link the reserved account to the user
      });

      await newReservedAccount.save();

      res.status(201).json({
        success: true,
        user: savedUser,
        accountDetails: reservedAccountDetails,
      });
    } catch (error) {
      console.error('Error during registration:', error.response?.data || error.message);

      if (error.response?.data?.responseCode === 'R42') {
        // Handle duplicate account error
        return res.status(400).json({
          message: 'A reserved account already exists for this customer. Please contact support if this is unexpected.',
        });
      }

      // Generic Monnify error fallback
      return res.status(500).json({
        message: 'Failed to create reserved account. Please try again later.',
      });
    }
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
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
