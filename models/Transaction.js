const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionReference: { type: String, required: true, unique: true },
  status: { type: String, required: true, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
