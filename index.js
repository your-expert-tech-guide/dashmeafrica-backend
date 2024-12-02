const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

  
app.get('/', (req, res) => {
  res.send('API is running...');
});





const productRoutes = require('./routes/productRoutes');

// Use the product routes
app.use('/api/products', productRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
