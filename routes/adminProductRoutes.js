const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protectAdmin } = require('../middleware/adminMiddleware');

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
router.put('/:id', protectAdmin, async (req, res) => {
  const { title, description, category, price, priceCategory, location, tag } = req.body;

  console.log(req.body)

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

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});


module.exports = router;
