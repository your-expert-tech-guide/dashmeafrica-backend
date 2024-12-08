const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Monnify API credentials from .env
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com'; // Use `https://api.monnify.com` for production

const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'https://dashmeafrica-frontend.vercel.app',
  'https://dashmeafrica-frontend.onrender.com',
  'http://localhost:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy error: ${origin} is not allowed.`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Database connection error:', err));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Base API Endpoint
app.get('/', (req, res) => res.send('API is running...'));

// Function to get Monnify Bearer Token
const getMonnifyToken = async () => {
  try {
    // Construct the Base64-encoded apiKey:secretKey string
    const credentials = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    // Make the POST request to Monnify's login endpoint
    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/auth/login`,
      {}, // No body is required for this request
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64Credentials}`,
        },
      }
    );

    return response.data.responseBody.accessToken;
  } catch (error) {
    console.error(
      'Error fetching Monnify token:',
      error.response?.data || error.message
    );
    throw new Error('Failed to fetch Monnify token');
  }
};


// Endpoint to initiate payment
app.post('/api/payment', async (req, res) => {
  const { amount, email, phoneNumber, paymentReference } = req.body;

  if (!amount || !email || !phoneNumber || !paymentReference) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const token = await getMonnifyToken();
    const paymentData = {
      amount,
      currencyCode: 'NGN',
      customerName: email,
      customerEmail: email,
      customerPhone: phoneNumber,
      contractCode: MONNIFY_CONTRACT_CODE,
      paymentReference,
      redirectUrl: 'http://localhost:5173/adminDashboard',
    };

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paymentLink = response.data.responseBody?.checkoutUrl;
    if (paymentLink) {
      return res.status(200).json({ success: true, paymentUrl: paymentLink });
    } else {
      return res.status(500).json({ success: false, message: 'Payment initiation failed' });
    }
  } catch (error) {
    console.error('Error during payment initiation:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'An error occurred during payment initiation' });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
