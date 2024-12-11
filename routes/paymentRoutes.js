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
// const disburseFunds = async ({ amount, bankCode, accountNumber, accountName, narration, reference }) => {
//     try {
//         const token = await getMonnifyToken(); // Get Bearer Token

//         const response = await axios.post(
//             `${MONNIFY_BASE_URL}/api/v2/disbursements/single`,
//             {
//                 amount,
//                 reference,
//                 narration,
//                 destinationBankCode: bankCode,
//                 destinationAccountNumber: accountNumber,
//                 currency: "NGN", // Fixed to Nigerian Naira
//                 sourceAccountNumber: '3655292498',
//                 destinationAccountName: accountName,
//             },
//             { headers: { Authorization: `Bearer ${token}` } }
//         );

//         return response.data;
//     } catch (error) {
//         console.error('Error disbursing funds:', error.response?.data || error.message);
//         throw new Error('Failed to disburse funds');
//     }
// };

  
  
// // Function to get the status of a disbursement
// const getDisbursementStatus = async (reference) => {
//     try {
//         const token = await getMonnifyToken(); // Get Bearer Token

//         const response = await axios.get(
//             `${MONNIFY_BASE_URL}/api/v2/disbursements/single/summary?reference=${reference}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//         );

//         return response.data;
//     } catch (error) {
//         console.error('Error fetching disbursement status:', error.response?.data || error.message);
//         throw new Error('Failed to fetch disbursement status');
//     }
// };

// // Route: Verify Payment and Disburse Funds
// router.post('/verify-payment', async (req, res) => {
//     const { paymentReference, sellerAccount } = req.body;
//     const { accountNumber, accountName, accountCode } = sellerAccount;

//     if (!paymentReference || !sellerAccount) {
//         return res.status(400).json({
//             success: false,
//             message: 'Transaction reference and seller account details are required.',
//         });
//     }

//     try {
//         const token = await getMonnifyToken();

//         // Step 1: Verify Payment Status
//         const response = await axios.get(
//             `${MONNIFY_BASE_URL}/api/v2/merchant/transactions/query?paymentReference=${paymentReference}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//         );

//         console.log("Verify payment data",response.data)
//         const paymentDetails = response.data.responseBody;
//         const paymentStatus = paymentDetails.paymentStatus;
//         const amountPaid = paymentDetails.amountPaid;

//         if (paymentStatus === 'PAID') {
//             // Step 2: Calculate Disbursement Amount
//             const disbursementAmount = (0.8 * amountPaid).toFixed(2);
//             const disbursementReference = `${Date.now()}`;

//             // Step 3: Disburse Funds to Seller
//             const sellerNarration = `Disbursement from Dashme Africa. Payment Reference: ${disbursementReference}`;
//             const disbursementResponse = await disburseFunds({
//                 amount: disbursementAmount,
//                 bankCode: accountCode,
//                 accountName,
//                 accountNumber,
//                 narration: sellerNarration,
//                 reference: disbursementReference,
//             });

//             console.log("Disbursed data", disbursementResponse)

//             if (disbursementResponse.requestSuccessful) {
//                 // Step 4: Verify Disbursement Status
//                 const disbursementStatusResponse = await getDisbursementStatus(disbursementReference);
//                 console.log(disbursementStatusResponse.responseBody)

//                 if (disbursementStatusResponse.responseBody.status === 'SUCCESS') {
//                     return res.status(200).json({
//                         success: true,
//                         message: 'Payment verified, funds disbursed, and disbursement confirmed successfully.',
//                         disbursementDetails: disbursementStatusResponse.responseBody,
//                     });
//                 } else {
//                     return res.status(200).json({
//                         success: true,
//                         message: 'Payment verified and funds disbursed, but disbursement confirmation is pending.',
//                         disbursementStatus: disbursementStatusResponse.responseBody,
//                     });
//                 }
//             } else {
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Payment verified, but failed to disburse funds.',
//                 });
//             }
//         } else {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Payment not successful.',
//             });
//         }
//     } catch (error) {
//         console.error('Error during payment and disbursement process:', error.response?.data || error.message);
//         return res.status(500).json({
//             success: false,
//             message: 'Error during payment and disbursement process.',
//         });
//     }
// });


// router.post('/authorize-transfer', async (req, res) => {
//     const { reference, otp } = req.body;

// console.log(req.body)
  
//     if (!reference || !otp) {
//       return res.status(400).json({ responseMessage: 'Reference and OTP are required' });
//     }

//     const token = await getMonnifyToken();

//     try {
//       const response = await axios.post(
//         `${MONNIFY_BASE_URL}/api/v2/disbursements/single/validate-otp`,
//         {
//           reference,
//           authorizationCode: otp,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
  
//       console.log(response.data)
//       res.status(200).json(response.data);
//     } catch (error) {
//         console.log(error)

//       res.status(500).json(
//         error.response
//           ? error.response.data
//           : { responseMessage: 'An error occurred while authorizing the transfer' }
//       );
//     }
//   });

  

//   module.exports = router;


const express = require('express');
const router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');
const Transaction = require('../models/Transaction'); // Ensure this model is defined

dotenv.config();

const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

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
            redirectUrl: 'http://localhost:5173/verify-payment',
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
        const transactionReference = response.data.responseBody?.transactionReference;

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
        console.error('Error initiating payment:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Error initiating payment' });
    }
});

// Route: Verify Payment
router.get('/verify-payment', async (req, res) => {
    const { paymentReference } = req.query;

    if (!paymentReference) {
        return res.status(400).json({ success: false, message: 'Payment reference is required' });
    }

    try {
        const token = await getMonnifyToken();

        const response = await axios.get(
            `${MONNIFY_BASE_URL}/api/v2/merchant/transactions/query?paymentReference=${paymentReference}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const paymentStatus = response.data.responseBody.paymentStatus;

        if (paymentStatus === 'PAID') {
            return res.status(200).json({
                success: true,
                message: 'Payment successful. Please enter the OTP to authorize the transaction.',
                reference: paymentReference,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment failed or pending.',
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error.response?.data || error.message);
        return res.status(500).json({ success: false, message: 'Error verifying payment' });
    }
});

// Route: Authorize Transfer with OTP
router.post('/authorize-transfer', async (req, res) => {
    const { reference, otp } = req.body;

    if (!reference || !otp) {
        return res.status(400).json({ success: false, message: 'Reference and OTP are required' });
    }

    try {
        const token = await getMonnifyToken();

        const response = await axios.post(
            `${MONNIFY_BASE_URL}/api/v2/disbursements/single/validate-otp`,
            { reference, authorizationCode: otp },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        const isAuthorized = response.data.responseCode === '00';

        if (isAuthorized) {
            return res.status(200).json({
                success: true,
                message: 'Payment successful and authorized.',
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP or authorization failed.',
            });
        }
    } catch (error) {
        console.error('Error authorizing transfer:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: 'Error authorizing transfer',
        });
    }
});

module.exports = router;

  