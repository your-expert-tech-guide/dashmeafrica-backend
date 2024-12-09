// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// const dotenv = require('dotenv');
// const Transaction = require('../models/Transaction'); // Adjust the path to where your model is defined


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
//         console.error(
//             'Error fetching Monnify token:',
//             error.response?.data || error.message
//         );
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

//         console.log(response)

//         const paymentLink = response.data.responseBody?.checkoutUrl;
//         if (paymentLink) {
//             return res.status(200).json({ success: true, responseBody: response.data.responseBody });
//         } else {
//             return res.status(500).json({ success: false, message: 'Payment initiation failed' });
//         }
//     } catch (error) {
//         console.error('Error during payment initiation:', error.response?.data || error.message);
//         res.status(500).json({ success: false, message: 'An error occurred during payment initiation' });
//     }
// });

// router.post('/verify-payment', async (req, res) => {
//     const { transactionReference } = req.body;

//     console.log(transactionReference)

//     if (!transactionReference) {
//         return res.status(400).json({ success: false, message: "Transaction reference is required." });
//     }

//     try {
//         // Fetch Monnify Bearer Token
//         const token = await getMonnifyToken();
//         const response = await axios.get(
//             `${MONNIFY_BASE_URL}/api/v2/transactions/${transactionReference}`,
//             {
//                 headers: { Authorization: `Bearer ${token}` },
//             }
//         );

//         console.log(response)

//         const paymentStatus = response.data.responseBody.paymentStatus;
//         if (paymentStatus === 'PAID') {
//             const amountPaid = response.data.responseBody.amountPaid;

//             // Fetch seller's reserved account details (hardcoded example)
//             const sellerAccount = {
//                 bankCode: '232', // Example: Sterling Bank
//                 accountNumber: '7003902833',
//             };

//             // Disburse funds to the seller
//             await disburseFunds(amountPaid, sellerAccount);

//             return res.status(200).json({
//                 success: true,
//                 message: 'Payment verified and disbursed to the seller',
//             });

//             //     // Update your database transaction status
//             //     // await Transaction.updateOne(
//             //     //     { transactionReference },
//             //     //     { status: "PAID" }
//             //     // );
//             //     return res.json({ success: true, message: "Payment verified successfully." });

//         } else {
//             return res.status(400).json({ success: false, message: 'Payment not successful' });
//         }
//     } catch (error) {
//         console.error('Error verifying payment:', error.response?.data || error.message);
//         res.status(500).json({ success: false, message: 'Error verifying payment' });
//     }

// });




// // router.post('/monnify-webhook', async (req, res) => {
// //     const notificationData = req.body;

// //     console.log(req.body)

// //     // Verify the notification signature (optional but recommended)
// //     const monnifySignature = req.headers['monnify-signature'];
// //     const calculatedSignature = crypto
// //         .createHmac('sha512', MONNIFY_SECRET_KEY)
// //         .update(JSON.stringify(notificationData))
// //         .digest('hex');

// //     if (monnifySignature !== calculatedSignature) {
// //         return res.status(401).json({ success: false, message: 'Invalid signature' });
// //     }

// //     try {
// //         const { paymentReference, paymentStatus, amountPaid } = notificationData;

// //         if (paymentStatus === 'PAID') {
// //             // Update the transaction status in your database
// //             await Transaction.updateOne(
// //                 { paymentReference },
// //                 { $set: { status: 'PAID', amountPaid } }
// //             );

// //             // Disburse funds to the seller (if applicable)
// //             const sellerAccount = await findSellerAccount(paymentReference);
// //             if (sellerAccount) {
// //                 await disburseFunds(amountPaid, sellerAccount);
// //             }

// //             return res.status(200).json({ success: true, message: 'Payment verified' });
// //         }

// //         res.status(200).json({ success: true, message: 'Payment status recorded' });
// //     } catch (error) {
// //         console.error('Error verifying payment:', error.response?.data || error.message);
// //         res.status(500).json({ success: false, message: 'Error verifying payment' });
// //     }
// // });


// // router.get('/status', async (req, res) => {
// //     const { paymentReference } = req.query;

// //     console.log(paymentReference)

// //     if (!paymentReference) {
// //         return res.status(400).json({ success: false, message: 'Payment reference is required' });
// //     }

// //     try {
// //         // Fetch transaction from the database
// //         const transaction = await Transaction.findOne({ paymentReference });

// //         if (!transaction) {
// //             return res.status(404).json({ success: false, message: 'Transaction not found' });
// //         }

// //         return res.status(200).json({
// //             success: true,
// //             paymentStatus: transaction.status,
// //             amountPaid: transaction.amountPaid,
// //         });
// //     } catch (error) {
// //         console.error('Error fetching payment status:', error.message);
// //         res.status(500).json({ success: false, message: 'Server error' });
// //     }
// // });


// // Function: Disburse Funds
// // const disburseFunds = async (amount, sellerAccount) => {
// //     try {
// //         const token = await getMonnifyToken();

// //         const platformShare = (20 / 100) * amount;
// //         const sellerShare = amount - platformShare;

// //         const disbursementPayload = {
// //             amount: sellerShare,
// //             reference: `disb-${Date.now()}`,
// //             narration: 'Seller payment for goods',
// //             destinationBankCode: sellerAccount.bankCode,
// //             destinationAccountNumber: sellerAccount.accountNumber,
// //             currency: 'NGN',
// //         };

// //         const response = await axios.post(
// //             `${MONNIFY_BASE_URL}/api/v1/disbursements/single`,
// //             disbursementPayload,
// //             {
// //                 headers: {
// //                     Authorization: `Bearer ${token}`,
// //                     'Content-Type': 'application/json',
// //                 },
// //             }
// //         );

// //         console.log('Disbursement successful:', response.data);
// //     } catch (error) {
// //         console.error('Error during disbursement:', error.response?.data || error.message);
// //         throw new Error('Failed to disburse funds');
// //     }
// // };

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

        console.log(response)

        const paymentLink = response.data.responseBody?.checkoutUrl;
        if (paymentLink) {
            return res.status(200).json({ success: true, responseBody: response.data.responseBody });
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
    const { transactionReference } = req.body;

    if (!transactionReference) {
        return res.status(400).json({ success: false, message: 'Transaction reference is required.' });
    }

    try {
        // Fetch Monnify Bearer Token
        const token = await getMonnifyToken();

        // Verify transaction
        const response = await axios.get(
            `${MONNIFY_BASE_URL}/api/v2/transactions/${transactionReference}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const transactionData = response.data.responseBody;
        const paymentStatus = transactionData.paymentStatus;

        if (paymentStatus === 'PAID') {
            // Update database (optional)
            await Transaction.updateOne(
                { transactionReference },
                { status: 'PAID', updatedAt: new Date() }
            );

            return res.status(200).json({
                success: true,
                message: 'Payment successfully verified.',
                transactionData,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment is not yet completed.',
                transactionData,
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Error verifying payment' });
    }
});


// Route: Webhook for Payment Notifications
router.post('/webhook', async (req, res) => {
    console.log('Webhook received:', req.body); // Log incoming data
    const { transactionReference, paymentStatus } = req.body;

    // Respond quickly to Monnify to acknowledge receipt
    res.status(200).send('Webhook received');

    try {
        // Handle the webhook logic here
        const token = await getMonnifyToken();
        const response = await axios.get(
            `${MONNIFY_BASE_URL}/api/v2/transactions/${transactionReference}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const transactionData = response.data.responseBody;
        if (transactionData.paymentStatus === 'PAID') {
            await Transaction.updateOne(
                { transactionReference },
                { status: 'PAID', updatedAt: new Date() }
            );
            console.log('Transaction verified and updated');
        } else {
            console.log('Transaction not yet completed');
        }
    } catch (error) {
        console.error('Error processing webhook:', error.message);
    }
});


module.exports = router;
