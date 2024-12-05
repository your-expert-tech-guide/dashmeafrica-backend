const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminMiddleware');

// @desc Admin dashboard
// @route GET /api/admin/dashboard
// @access Private
router.get('/dashboard', protectAdmin, (req, res) => {
  res.json({ message: `Welcome ${req.admin.email}, this is your dashboard` });
});

module.exports = router;
