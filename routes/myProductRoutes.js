const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration (Make sure your .env file is set up)
cloudinary.config({
    cloud_name: "df2q6gyuq",
    api_key: "259936754944698",
    api_secret: "bTfV4_taJPd1zxxk1KJADTL8JdU",
});

// Multer memory storage (since we're uploading to Cloudinary)
// const storage = multer.memoryStorage(); // Store file in memory
// const upload = multer({ storage: storage });


router.get('/', async (req, res) => {
    const { uploader } = req.query;
    console.log("Uploader Query Param:", uploader); // Add this line

    if (!uploader) {
        return res.status(400).json({ message: 'Uploader ID is required' });
    }

    try {
        const myProducts = await Product.find({ uploader }).populate('uploader', 'username email');
        if (!myProducts || myProducts.length === 0) {
            return res.status(404).json({ message: 'No products found for this uploader' });
        }

        res.status(200).json(myProducts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});



router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  });

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
          return res.status(404).json({ message: 'Product not found' });
        }
    
        res.status(200).json({ message: 'Product deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
      }
});


module.exports = router;


