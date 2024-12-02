const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @desc Create a new product
// @route POST /api/products
// @access Public
router.post('/', async (req, res) => {
  const { name, description, category, subcategory, price, priceCategory, location, image, isPremium } = req.body;
console.log(name, category, price, image)
  if (!name || !category || !price || !image) {
    return res.status(400).json({ message: 'Please fill all required fields and provide an image URL' });
  }

  try {
    const product = new Product({
      name,
      description,
      category,
      subcategory,
      price,
      priceCategory,
      image, // Store image URL in an array for consistency
      location,
      isPremium: isPremium === 'true', // Convert isPremium to boolean
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc Get all products
// @route GET /api/products
// @access Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
