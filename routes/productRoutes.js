// const express = require('express');
// const router = express.Router();
// const Product = require('../models/Product');
// const multer = require('multer');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// // // @desc Create a new product
// // // @route POST /api/products
// // // @access Public

// router.post('/', upload.single('image'), async (req, res) => {
//   console.log('Form data received:', req.body);
//   console.log('Uploaded file:', req.file);

//   const { title, description, category, price, priceCategory, location } = req.body;
//   const image = req.file ? req.file.path : null;

//   if (!title || !category || !price) {
//     return res.status(400).json({
//       message: 'Please fill all required fields and provide an image',
//     });
//   }

//   try {
//     const product = new Product({
//       title,
//       description,
//       category,
//       price,
//       priceCategory,
//       image,
//       location,
//     });

//     const createdProduct = await product.save();
//     res.status(201).json(createdProduct);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// });

// module.exports = router;


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
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// @desc Create a new product
// @route POST /api/products
// @access Public

router.post('/', upload.single('image'), async (req, res) => {
  console.log('Form data received:', req.body);
  console.log('Uploaded file:', req.file);

  const { title, description, category, price, priceCategory, location } = req.body;

  if (!title || !category || !price) {
    return res.status(400).json({
      message: 'Please fill all required fields and provide an image',
    });
  }

  try {
    // Upload image to Cloudinary
    let imageUrl = '';
    if (req.file) {
      // Wrap upload in a promise to handle async correctly
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) {
              reject(error); // Reject the promise if there's an error
            }
            resolve(result); // Resolve with the result if successful
          }
        );

        require('streamifier').createReadStream(req.file.buffer).pipe(stream);
      });

      try {
        const result = await uploadPromise; // Await the promise to get the result
        imageUrl = result.secure_url; // Get the secure URL from Cloudinary
      } catch (error) {
        console.error(error);  // Logs the entire error object for better insight
        return res.status(500).json({ message: 'Image upload failed', error: error.message });

      }
    }


    const product = new Product({
      title,
      description,
      category,
      price,
      priceCategory,
      image: imageUrl, // Save the Cloudinary image URL
      location,
    });

    const createdProduct = await product.save();
    if (!createdProduct) {
      return res.status(500).json({ message: 'Failed to create product' });
    }
    res.status(201).json(createdProduct);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
