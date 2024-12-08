const mongoose = require('mongoose');

const ReservedAccountSchema = new mongoose.Schema({
    accountReference: { type: String, required: true, unique: true },
    accountName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    accounts: [
      {
        bankName: String,
        accountNumber: String,
        bankCode: String,
      },
    ],
    balance: { type: Number, default: 0 }, // User's balance
    transactions: [
      {
        transactionReference: String,
        amountPaid: Number,
        paymentStatus: String,
        timestamp: Date,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('ReservedAccount', ReservedAccountSchema);
