const express = require('express');
const router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();


// Monnify API credentials
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

// Function to get Monnify Bearer Token
const getMonnifyToken = async () => {
  try {
    const credentials = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/auth/login`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64Credentials}`,
        },
      }
    );

    return response.data.responseBody.accessToken;
  } catch (error) {
    console.error(
          'Error fetching Monnify token:',
      error.response?.data || error.message
    );
    throw new Error('Failed to fetch Monnify token');
  }
};

// Route: Initiate Payment
router.post('/initiate-payment', async (req, res) => {
  const { amount, email, phoneNumber, paymentReference } = req.body;

  if (!amount || !email || !phoneNumber || !paymentReference) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const token = await getMonnifyToken();
    const paymentData = {
      amount,
      currencyCode: 'NGN',
      customerName: email,
      customerEmail: email,
      customerPhone: phoneNumber,
      contractCode: MONNIFY_CONTRACT_CODE,
      paymentReference,
      redirectUrl: 'http://localhost:5173/payment-page',
    };

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paymentLink = response.data.responseBody?.checkoutUrl;
    if (paymentLink) {
      return res.status(200).json({ success: true, paymentUrl: paymentLink });
    } else {
      return res.status(500).json({ success: false, message: 'Payment initiation failed' });
    }
  } catch (error) {
    console.error('Error during payment initiation:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'An error occurred during payment initiation' });
  }
});

// Route: Verify Payment
router.post('/verify-payment', async (req, res) => {
  const { paymentReference } = req.body;

  console.log(paymentReference)

  if (!paymentReference) {
    return res.status(400).json({ success: false, message: 'Payment reference is required' });
  }



  try {

    // Introduce a delay before verifying
    await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 seconds delay

    const token = await getMonnifyToken();

const transactionReference = encodeURIComponent(paymentReference);
    
    const response = await axios.get(
      `${MONNIFY_BASE_URL}/api/v2/transactions/${transactionReference}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const paymentStatus = response.data.responseBody.paymentStatus;
    if (paymentStatus === 'PAID') {
      const amountPaid = response.data.responseBody.amountPaid;

      // Fetch seller's reserved account details (hardcoded example)
      const sellerAccount = {
        bankCode: '232', // Example: Sterling Bank
        accountNumber: '7003902833',
      };

      // Disburse funds to the seller
      await disburseFunds(amountPaid, sellerAccount);

      return res.status(200).json({
        success: true,
        message: 'Payment verified and disbursed to the seller',
      });
    } else {
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Error verifying payment' });
  }
});


router.post('/monnify-webhook', async (req, res) => {
    const notificationData = req.body;
  
    // Verify the notification signature (optional but recommended)
    const monnifySignature = req.headers['monnify-signature'];
    const calculatedSignature = crypto
      .createHmac('sha512', MONNIFY_SECRET_KEY)
      .update(JSON.stringify(notificationData))
      .digest('hex');
  
    if (monnifySignature !== calculatedSignature) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }
  
    try {
      const { paymentReference, paymentStatus, amountPaid } = notificationData;
  
      if (paymentStatus === 'PAID') {
        // Update the transaction status in your database
        await Transaction.updateOne(
          { paymentReference },
          { $set: { status: 'PAID', amountPaid } }
        );
  
        // Disburse funds to the seller (if applicable)
        const sellerAccount = await findSellerAccount(paymentReference);
        if (sellerAccount) {
          await disburseFunds(amountPaid, sellerAccount);
        }
  
        return res.status(200).json({ success: true, message: 'Payment verified' });
      }
  
      res.status(200).json({ success: true, message: 'Payment status recorded' });
    } catch (error) {
      console.error('Error handling webhook:', error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

// Function: Disburse Funds

const disburseFunds = async (amount, sellerAccount) => {
  try {
    const token = await getMonnifyToken();

    const platformShare = (20 / 100) * amount;
    const sellerShare = amount - platformShare;

    const disbursementPayload = {
      amount: sellerShare,
      reference: `disb-${Date.now()}`,
      narration: 'Seller payment for goods',
      destinationBankCode: sellerAccount.bankCode,
      destinationAccountNumber: sellerAccount.accountNumber,
      currency: 'NGN',
    };

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/disbursements/single`,
      disbursementPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Disbursement successful:', response.data);
  } catch (error) {
    console.error('Error during disbursement:', error.response?.data || error.message);
    throw new Error('Failed to disburse funds');
  }
};

module.exports = router;
