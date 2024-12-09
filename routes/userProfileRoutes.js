const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ReservedAccount = require('../models/ReservedAccount');

// Example: Protected Profile Route
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// Endpoint to get user details along with their reserved account details
router.get('/userAccountDetails', protect, async (req, res) => {
  try {
    // Fetch the user's reserved account details using their userId
    const reservedAccount = await ReservedAccount.findOne({ userId: req.user._id }).populate('userId');

    if (!reservedAccount) {
      return res.status(404).json({ message: 'Reserved account not found for this user' });
    }

    res.status(200).json({
      user: {
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName,
      },
      reservedAccount: {
        accountReference: reservedAccount.accountReference,
        accountName: reservedAccount.accountName,
        customerEmail: reservedAccount.customerEmail,
        balance: reservedAccount.balance,
        accounts: reservedAccount.accounts,
      },
    });
  } catch (error) {
    console.error('Error fetching user and account details:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get seller account by ID
router.get('/seller/:id/account', async (req, res) => {
  const { id } = req.params; // Extract the seller ID from the route parameter

  console.log(id)

  try {
      // Find the seller by their ID
      // const sellerAccount = await ReservedAccount.findById(id).populate('userId');

      const sellerAccount = await ReservedAccount.findOne({ userId: id });

      // console.log(sellerAccount.accounts[0].accountNumber)
      const sellerAcctNumber = sellerAccount.accounts[0].accountNumber

      if (!sellerAccount) {
          return res.status(404).json({ message: 'Seller not found' });
      }

      res.status(200).json({ sellerAcctNumber });
  } catch (error) {
      console.error('Error fetching seller account:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
