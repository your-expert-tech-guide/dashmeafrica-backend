
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

// router.post('/', upload.single('image'), async (req, res) => {
//   console.log('Form data received:', req.body);
//   console.log('Uploaded file:', req.file);

//   const { title, description, category, price, priceCategory, location } = req.body;

//   if (!title || !category || !price) {
//     return res.status(400).json({
//       message: 'Please fill all required fields and provide an image',
//     });
//   }

//   try {
//     // Upload image to Cloudinary
//     let imageUrl = '';
//     if (req.file) {
//       const uploadPromise = new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           { resource_type: 'image' },
//           (error, result) => {
//             if (error) {
//               reject(error);
//             }
//             resolve(result);
//           }
//         );

//         require('streamifier').createReadStream(req.file.buffer).pipe(stream);
//       });

//       try {
//         const result = await uploadPromise;
//         imageUrl = result.secure_url;
//       } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Image upload failed', error: error.message });
//       }
//     }

//     const product = new Product({
//       title,
//       description,
//       category,
//       price,
//       priceCategory,
//       image: imageUrl,
//       location,
//       tag: "sell", // Explicitly set the tag to "sell"
//     });

//     console.log('Product data to be saved:', product); // Debug log

//     const createdProduct = await product.save();
//     if (!createdProduct) {
//       return res.status(500).json({ message: 'Failed to create product' });
//     }
//     res.status(201).json(createdProduct);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// });

router.post('/', upload.single('image'), async (req, res) => {
  console.log('Form data received:', req.body);
  console.log('Uploaded file:', req.file);

  const { title, description, category, price, priceCategory, location, uploaderId } = req.body;

  console.log(uploaderId)

  if (!title || !category || !price || !uploaderId) {
    return res.status(400).json({
      message: 'Please fill all required fields, provide an image, and include uploader information',
    });
  }

  try {
    // Upload image to Cloudinary
    let imageUrl = '';
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
        imageUrl = result.secure_url;
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Image upload failed', error: error.message });
      }
    }

    const product = new Product({
      title,
      description,
      category,
      price,
      priceCategory,
      image: imageUrl,
      location,
      tag: 'sell', // Explicitly set the tag to "sell"
      uploaderId, // Add the uploader ID
      availability: true, // Default to available
    });

    console.log('Product data to be saved:', product); // Debug log

    const createdProduct = await product.save();
    if (!createdProduct) {
      return res.status(500).json({ message: 'Failed to create product' });
    }
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


router.post('/donate', upload.single('image'), async (req, res) => {
  console.log('Form data received:', req.body);
  console.log('Uploaded file:', req.file);

  const { title, description, category, location } = req.body;

  if (!title || !category || !location) {
    return res.status(400).json({
      message: 'Please fill all required fields and provide an image',
    });
  }

  try {
    // Upload image to Cloudinary
    let imageUrl = '';
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
        imageUrl = result.secure_url;
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Image upload failed', error: error.message });
      }
    }

    const product = new Product({
      title,
      description,
      category,
      image: imageUrl,
      location,
      tag: "donate", // Explicitly set the tag to "sell"
    });

    console.log('Product to be donated to be saved:', product); // Debug log

    const createdProduct = await product.save();
    if (!createdProduct) {
      return res.status(500).json({ message: 'Failed to create product' });
    }
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});




// @desc Get all products
// @route GET /api/products
// @access Public
// router.get('/', async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// });

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('uploader', 'username email'); // Include username and email from the User model
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


// @desc Get a product by ID
// @route GET /api/products/:id
// @access Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    // If the error is due to an invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// router.patch('/:id/availability', async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     product.availability = !product.availability; // Toggle availability
//     const updatedProduct = await product.save();
//     res.status(200).json(updatedProduct);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// });


module.exports = router;


