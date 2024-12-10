const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ReservedAccount = require('../models/ReservedAccount');
const User = require('../models/User');

// Example: Protected Profile Route
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, lastName, username, email, address, bio } = req.body;

    console.log(req.body)

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { fullName: fullName, lastname: lastName, username, email, address, bio },
      { new: true }
    );

    console.log(updatedUser)
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
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

// Route to get seller account details by seller ID
router.get('/seller/:id/account', async (req, res) => {
  const { id } = req.params; // Extract the seller ID from the route parameter

  try {
    // Find the seller's account details from the ReservedAccount model
    const sellerAccount = await ReservedAccount.findOne({ userId: id });

    if (!sellerAccount) {
      return res.status(404).json({ message: "Seller account not found." });
    }

    // console.log(sellerAccount)
    // Send back the seller account details (account number, name, and code)
    res.json({
      sellerAcctNumber: sellerAccount.accounts[0].accountNumber,
      sellerAcctName: sellerAccount.accountName,
      sellerAcctBank: sellerAccount.accounts[0].bankName,
      sellerAcctCode: sellerAccount.accounts[0].bankCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching seller account." });
  }
});

module.exports = router;
