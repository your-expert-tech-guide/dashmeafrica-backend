// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// const dotenv = require('dotenv');
// const Transaction = require('../models/Transaction'); // Ensure the model is correctly defined and imported

// dotenv.config();

// // Monnify API credentials
// const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
// const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
// const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
// const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

// // Function to get Monnify Bearer Token
// const getMonnifyToken = async () => {
//     try {
//         const credentials = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
//         const base64Credentials = Buffer.from(credentials).toString('base64');

//         const response = await axios.post(
//             `${MONNIFY_BASE_URL}/api/v1/auth/login`,
//             {},
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Basic ${base64Credentials}`,
//                 },
//             }
//         );

//         return response.data.responseBody.accessToken;
//     } catch (error) {
//         console.error('Error fetching Monnify token:', error.response?.data || error.message);
//         throw new Error('Failed to fetch Monnify token');
//     }
// };

// // Route: Initiate Payment
// router.post('/initiate-payment', async (req, res) => {
//     const { amount, email, phoneNumber, paymentReference } = req.body;

//     if (!amount || !email || !phoneNumber || !paymentReference) {
//         return res.status(400).json({ success: false, message: 'All fields are required' });
//     }

//     try {
//         const token = await getMonnifyToken();
//         const paymentData = {
//             amount,
//             currencyCode: 'NGN',
//             customerName: email,
//             customerEmail: email,
//             customerPhone: phoneNumber,
//             contractCode: MONNIFY_CONTRACT_CODE,
//             paymentReference,
//             redirectUrl: 'http://localhost:5173/payment-page',
//         };

//         const response = await axios.post(
//             `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
//             paymentData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );


//         const transactionReference = response.data.responseBody?.transactionReference;
//         const paymentLink = response.data.responseBody?.checkoutUrl;

//         if (paymentLink) {
//             return res.status(200).json({
//                 success: true,
//                 paymentLink,
//                 transactionReference,
//             });
//         } else {
//             return res.status(500).json({ success: false, message: 'Payment initiation failed' });
//         }
//     } catch (error) {
//         console.error('Error during payment initiation:', error.response?.data || error.message);
//         res.status(500).json({ success: false, message: 'An error occurred during payment initiation' });
//     }
// });


// // Function to disburse funds to the seller
// const disburseFunds = async ({ amount, bankCode, accountNumber, narration }) => {
//     try {
//         const token = await getMonnifyToken(); // Get Bearer Token

//         const response = await axios.post(
//             `${MONNIFY_BASE_URL}/api/v1/disbursements/single`,
//             {
//                 amount,
//                 destinationBankCode: bankCode,
//                 destinationAccountNumber: accountNumber,
//                 narration,
//             },
//             { headers: { Authorization: `Bearer ${token}` } }
//         );

//         return response.data;
//     } catch (error) {
//         console.error('Error disbursing funds:', error.response?.data || error.message);
//         throw new Error('Failed to disburse funds');
//     }
// };


// // Route: Verify Payment
// router.post('/verify-payment', async (req, res) => {
//     const {
//         customerBankCode,
//         customerAccountNumber,
//         sellerBankCode,
//         sellerAccountNumber,
//         amount
//     } = req.body;

//     // Validate the required fields
//     if ( !sellerBankCode || !sellerAccountNumber || !amount) {
//         return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     try {
//         // Get Monnify token
//         const token = await getMonnifyToken();

//         // Verify payment status using Monnify API
//         const response = await axios.get(`${MONNIFY_BASE_URL}/api/v2/merchant/transactions/query?paymentReference=${paymentReference}`, {
//             headers: { Authorization: `Bearer ${token}` },
//         });

//         const paymentStatus = response.data.responseBody.paymentStatus;

//         // If payment is successful, proceed with disbursement
//         if (paymentStatus === 'PAID') {
//             // const amountToDisburse = (amount * 0.8).toFixed(2); // 80% to the customer
//             const amountToDisburse = "10000"; // 80% to the customer

//             // Disburse 80% to the customer
//             await disburseFunds({
//                 amount: amountToDisburse,
//                 reference: `disb-${Date.now()}`,
//                 narration: 'Disbursement for your sale.',
//                 destinationBankCode: customerBankCode,
//                 destinationAccountNumber: sellerAccountNumber,
//                 currency: 'NGN',
//                 sourceAccountNumber: "18835949303",
//                 destinationAccountName: customerAccountNumber,
//                 async: true,
//             });

//             // You may also want to handle updating the database with the transaction status
//             return res.status(200).json({ success: true, message: 'Payment verified and funds disbursed successfully.' });
//         } else {
//             return res.status(400).json({ success: false, message: 'Payment not successful' });
//         }
//     } catch (error) {
//         console.error('Error verifying payment:', error.response?.data || error.message);
//         res.status(500).json({ success: false, message: 'Error verifying payment' });
//     }
// });


// // Route: Verify Payment
// // router.post('/verify-payment', async (req, res) => {

// //     const { paymentReference } = req.body;

// //     if (!paymentReference) {
// //         return res.status(400).json({ success: false, message: 'Transaction reference is required.' });
// //     }

// //     try {
// //         const token = await getMonnifyToken();

// //         const response = await axios.get(`${MONNIFY_BASE_URL}/api/v2/merchant/transactions/query?paymentReference=${paymentReference}`, {
// //             headers: { Authorization: `Bearer ${token}` },
// //         });

// //         const paymentStatus = response.data.responseBody.paymentStatus;

// //         if (paymentStatus === 'PAID') {
// //             // Perform post-payment actions (e.g., update database, notify user)
// //             return res.status(200).json({ success: true, message: 'Payment verified successfully.' });
// //         } else {
// //             return res.status(400).json({ success: false, message: 'Payment not successful' });
// //         }
// //     } catch (error) {
// //         console.error('Error verifying payment:', error.response?.data || error.message);
// //         res.status(500).json({ success: false, message: 'Error verifying payment' });
// //     }

// // });

// module.exports = router;


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

// Function to disburse funds
const disburseFunds = async ({ amount, bankCode, accountNumber, narration }) => {
    try {
        const token = await getMonnifyToken();

        const response = await axios.post(
            `${MONNIFY_BASE_URL}/api/v2/disbursements/single`,
            {
                amount,
                destinationBankCode: bankCode,
                destinationAccountNumber: accountNumber,
                narration,
                currency: 'NGN',
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
router.post('/verify-payment', async (req, res) => {
    const { paymentReference, sellerBankCode, sellerAccountNumber, amount } = req.body;

    if (!paymentReference || !sellerBankCode || !sellerAccountNumber || !amount) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const token = await getMonnifyToken();

        const response = await axios.get(
            `${MONNIFY_BASE_URL}/api/v2/merchant/transactions/query?paymentReference=${paymentReference}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const paymentStatus = response.data.responseBody.paymentStatus;

        if (paymentStatus === 'PAID') {
            const amountToDisburse = (amount * 0.8).toFixed(2); // Adjust percentage if needed

            await disburseFunds({
                amount: amountToDisburse,
                bankCode: sellerBankCode,
                accountNumber: sellerAccountNumber,
                narration: 'Disbursement for your sale.',
            });

            // Update database if necessary
            return res.status(200).json({ success: true, message: 'Payment verified and funds disbursed successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Payment not successful' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Error verifying payment' });
    }
});

module.exports = router;
