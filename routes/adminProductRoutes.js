const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protectAdmin } = require('../middleware/adminMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration (Make sure your .env file is set up)
cloudinary.config({
  cloud_name: "df2q6gyuq",
  api_key: "259936754944698",
  api_secret: "bTfV4_taJPd1zxxk1KJADTL8JdU",
});

// Multer memory storage (since we're uploading to Cloudinary)
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// @desc Get all products
// @route GET /api/admin/products
// @access Private (Admin)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// Get a product by ID
router.get('/:id', protectAdmin, async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error.message);
      res.status(500).json({ message: 'Failed to fetch product', error: error.message });
    }
  });
  

// @desc Delete a product
// @route DELETE /api/admin/products/:id
// @access Private (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
    try {
      console.log('Product ID:', req.params.id);  // Log product ID for debugging
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      console.log('Product deleted:', product);  // Log successful deletion
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error.message);
      res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
});


// @desc Update a product
// @route PUT /api/admin/products/:id
// @access Private (Admin)
router.put('/:id', upload.single('image'), async (req, res) => {
  console.log('Form data received:', req.body);
  console.log('Uploaded file:', req.file);

  const { title, description, category, price, priceCategory, location, tag } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields if provided
    product.title = title || product.title;
    product.description = description || product.description;
    product.category = category || product.category;
    product.location = location || product.location;
    product.tag = tag || product.tag;

    // Only update price and priceCategory if the tag is not 'donate'
    if (tag !== 'donate') {
      if (price !== undefined) product.price = price;
      if (priceCategory !== undefined) product.priceCategory = priceCategory;
    } else {
      product.price = undefined;
      product.priceCategory = undefined;
    }

    // Upload new image to Cloudinary if provided
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );

        require('streamifier').createReadStream(req.file.buffer).pipe(stream);
      });

      try {
        const result = await uploadPromise;
        product.image = result.secure_url; // Update image URL in the product
      } catch (error) {
        console.error('Error uploading image:', error.message);
        return res.status(500).json({ message: 'Image upload failed', error: error.message });
      }
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});



module.exports = router;
