const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  paymentReference: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  amountPaid: { type: Number, required: true },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
