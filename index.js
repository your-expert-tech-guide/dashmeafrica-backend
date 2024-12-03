const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const allowedOrigins = [
  'https://dashmeafrica-frontend.onrender.com', // Production frontend
  'http://localhost:5173', // Local frontend
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy error: ${origin} is not allowed.`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add methods as needed
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Include cookies if necessary
};

app.use(cors(corsOptions));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Database connection error:', err));

// Health Check Endpoint
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Base API Endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Register Routes
app.use('/api/products', productRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
