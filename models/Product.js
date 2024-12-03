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
      type: String,
    },
    image: {
      type: String,
    },
    location: {
      type: String,
    },
    tag: {
      type: String,
      default: "sell", // Default value for items created through this route
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
