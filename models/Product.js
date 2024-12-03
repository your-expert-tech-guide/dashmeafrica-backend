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
      required: function () {
        return this.tag !== 'donate';
      },
    },
    priceCategory: {
      type: String,
      required: function () {
        return this.tag !== 'donate';
      },
    },
    image: {
      type: String,
    },
    location: {
      type: String,
    },
    tag: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
