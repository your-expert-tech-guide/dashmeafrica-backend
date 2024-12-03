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

// Allow only the frontend domain to make requests
const corsOptions = {
  origin: 'https://dashmeafrica-frontend.onrender.com', // Replace this with your frontend URL
  methods: ['GET', 'POST'], // Allow necessary HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers as needed
};

app.use(cors(corsOptions));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

  
app.get('/', (req, res) => {
  res.send('API is running...');
});






// Use the product routes
app.use('/api/products', productRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
