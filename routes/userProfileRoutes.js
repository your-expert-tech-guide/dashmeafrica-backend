const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Example: Protected Profile Route
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;