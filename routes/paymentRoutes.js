const express = require('express');
const router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');
const Transaction = require('../models/Transaction'); // Ensure the model is correctly defined and imported

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
        console.error('Error fetching Monnify token:', error.response?.data || error.message);
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


        const transactionReference = response.data.responseBody?.transactionReference;
        const paymentLink = response.data.responseBody?.checkoutUrl;

        if (paymentLink) {
            return res.status(200).json({
                success: true,
                paymentLink,
                transactionReference,
            });
        } else {
            return res.status(500).json({ success: false, message: 'Payment initiation failed' });
        }
    } catch (error) {
        console.error('Error during payment initiation:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'An error occurred during payment initiation' });
    }
});


// Function to disburse funds to the seller
const disburseFunds = async ({ amount, bankCode, accountNumber, accountName, narration }) => {
    try {
        const token = await getMonnifyToken(); // Get Bearer Token

        const response = await axios.post(
            `${MONNIFY_BASE_URL}/api/v2/disbursements/single`,
            {
                amount,
                reference: `DISBURSE-${Date.now()}`, // Unique reference
                narration,
                destinationBankCode: bankCode,
                destinationAccountNumber: accountNumber,
                currency: "NGN", // Fixed to Nigerian Naira
                sourceAccountNumber: '3655292498',
                destinationAccountName: accountName,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return response.data;
    } catch (error) {
        console.error('Error disbursing funds:', error.response?.data || error.message);
        throw new Error('Failed to disburse funds');
    }
};

  
  

// Route: Verify Payment
// router.post('/verify-payment', async (req, res) => {

//     const { paymentReference, sellerAccount } = req.body;
//     const { accountNumber, accountName, accountCode } = sellerAccount;
    
//     console.log(paymentReference)
    
//     if (!paymentReference) {
//       return res.status(400).json({ success: false, message: 'Transaction reference is required.' });
//     }
  
//     try {
//       const token = await getMonnifyToken();

//       const response = await axios.get(`${MONNIFY_BASE_URL}/api/v2/merchant/transactions/query?paymentReference=${paymentReference}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const paymentDetails = response.data.responseBody;
//       const paymentStatus = paymentDetails.paymentStatus;
//       const amountPaid = paymentDetails.amountPaid; // Get the total amount paid

//       if (paymentStatus === 'PAID') {

//         // Calculate 80% of the amount
//         const disbursementAmount = (0.8 * amountPaid).toFixed(2);

//          // Example seller's account details (you should replace these with actual seller data)
//          const sellerBankCode = accountCode; // Seller's bank code
//          const sellerAccountNumber = accountNumber; // Seller's account number
//          const sellerAccountName = accountName; // Seller's account number
//          const sellerNarration = `Disbursement from Dashme Africa. <br> paymentReference: ${paymentReference}`;

//          // Disburse Funds to Seller
//          const disbursementResponse = await disburseFunds({
//             amount: disbursementAmount,
//             reference: `DISBURSE-${Date.now()}`,
//             narration: sellerNarration,
//             destinationBankCode: sellerBankCode,
//             destinationAccountNumber: sellerAccountNumber,
//             currency: "NGN",
//             sourceAccountNumber: '3655292498',
//             destinationAccountName: sellerAccountName,
//          });

//          if (disbursementResponse.requestSuccessful) {
//             return res.status(200).json({
//                 success: true,
//                 message: 'Payment verified and funds disbursed successfully.',
//                 disbursementDetails: disbursementResponse.responseBody,
//             });
//         } else {
//             return res.status(500).json({
//                 success: false,
//                 message: 'Payment verified, but failed to disburse funds.',
//             });
//         }
//       } else {
//         return res.status(400).json({ success: false, message: 'Payment not successful' });
//       }
//     } catch (error) {
//         console.error('Error verifying payment:', error.response?.data || error.message);
//         res.status(500).json({ success: false, message: 'Error verifying payment' });
//       }
      
//   });   

// Route: Verify Payment and Disburse Funds
router.post('/verify-payment', async (req, res) => {
    const { paymentReference, sellerAccount } = req.body;
    const { accountNumber, accountName, accountCode } = sellerAccount;

    if (!paymentReference || !sellerAccount) {
        return res.status(400).json({
            success: false,
            message: 'Transaction reference and seller account details are required.',
        });
    }

    try {
        const token = await getMonnifyToken();

        // Verify Payment Status
        const response = await axios.get(
            `${MONNIFY_BASE_URL}/api/v2/merchant/transactions/query?paymentReference=${paymentReference}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const paymentDetails = response.data.responseBody;
        const paymentStatus = paymentDetails.paymentStatus;
        const amountPaid = paymentDetails.amountPaid;

        if (paymentStatus === 'PAID') {
            // Calculate 80% of the amount
            const disbursementAmount = (0.8 * amountPaid).toFixed(2);

            // Prepare disbursement details
            const sellerNarration = `Disbursement from Dashme Africa. Payment Reference: ${paymentReference}`;

            // Disburse Funds to Seller
            const disbursementResponse = await disburseFunds({
                amount: disbursementAmount,
                bankCode: accountCode,
                accountName,
                accountNumber,
                narration: sellerNarration,
            });

            if (disbursementResponse.requestSuccessful) {
                return res.status(200).json({
                    success: true,
                    message: 'Payment verified and funds disbursed successfully.',
                    disbursementDetails: disbursementResponse.responseBody,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Payment verified, but failed to disburse funds.',
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment not successful.',
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: 'Error verifying payment.',
        });
    }
});

  

  module.exports = router;