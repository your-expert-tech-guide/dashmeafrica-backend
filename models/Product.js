const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceCategory: {
      type: String, // Optional price category field
    },
    image: {
      type: String, // Single image URL instead of an array
      required: false,
    },
    location: {
      type: String,
    }
    // isPremium: {
    //   type: Boolean,
    //   default: false, // Default value is false
    // },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
