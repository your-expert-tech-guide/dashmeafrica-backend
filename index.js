const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

// const ReservedAccount = require('./models/ReservedAccount');

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const myProductRoutes = require("./routes/myProductRoutes");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Monnify API credentials from .env
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
const MONNIFY_BASE_URL =
	process.env.MONNIFY_BASE_URL || "https://sandbox.monnify.com"; // Use `https://api.monnify.com` for production
const GOSHIIP_BASE_URL = "https://delivery-staging.apiideraos.com/api/v2";
const AUTH_TOKEN = "Bearer <Your_Secret_Key>"; // Replace with your actual GoShiip API key

const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
	"https://dashmeafrica-frontend.vercel.app",
	"https://dashmeafrica-frontend.onrender.com",
	"http://localhost:5173",
];

const corsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error(`CORS policy error: ${origin} is not allowed.`));
		}
	},
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(cors(corsOptions));

// MongoDB Connection
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("Database connection error:", err));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Base API Endpoint
app.get("/", (req, res) => res.send("API is running!..."));

// Admin Routes
app.use("/api/adminDashboard", adminDashboardRoutes);
app.use("/api/adminProduct", adminProductRoutes);
app.use("/api/admin", adminRoutes);

// User Routes
app.use("/api/products", productRoutes);
app.use("/api/userProfile", userProfileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/myProducts", myProductRoutes);

// Function to get Monnify Bearer Token
const getMonnifyToken = async () => {
	try {
		const credentials = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
		const base64Credentials = Buffer.from(credentials).toString("base64");

		const response = await axios.post(
			`${MONNIFY_BASE_URL}/api/v1/auth/login`,
			{},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${base64Credentials}`,
				},
			}
		);

		return response.data.responseBody.accessToken;
	} catch (error) {
		console.error(
			"Error fetching Monnify token:",
			error.response?.data || error.message
		);
		throw new Error("Failed to fetch Monnify token");
	}
};

// Endpoint to get available couriers
app.get("/api/getAvailableCouriers", async (req, res) => {
	const { type } = req.query; // Get the type from the query params

	if (!type) {
		return res.status(400).json({ message: "The type field is required." });
	}

	try {
		const response = await axios.get(
			`${GOSHIIP_BASE_URL}/token/shipments/courier-partners`,
			{
				params: { type },
				headers: {
					Authorization: AUTH_TOKEN,
				},
			}
		);
		res.status(200).send(response.data); // Send the couriers list back to the frontend
	} catch (error) {
		console.error(
			"Error fetching couriers:",
			error.response?.data || error.message
		);
		res
			.status(500)
			.send(error.response?.data || { message: "Internal Server Error" });
	}
});

// Endpoint to get rates from GoShiip
app.post("/api/getRate", async (req, res) => {
	try {
		const { carrierName, payload } = req.body;

		const response = await axios.post(
			`${GOSHIIP_BASE_URL}/token/tariffs/getpricesingle/${carrierName}`,
			payload,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: AUTH_TOKEN,
				},
			}
		);

		res.status(200).send(response.data);
	} catch (error) {
		console.error(
			"Error fetching rate:",
			error.response?.data || error.message
		);
		res
			.status(500)
			.send(error.response?.data || { message: "Internal Server Error" });
	}
});

// Endpoint to get shipment rates
app.post("/api/get-shipment-rates", async (req, res) => {
	const { type, toAddress, fromAddress, parcels, items } = req.body;

	try {
		const response = await axios.post(
			"https://delivery-staging.apiideraos.com/api/v2/token/tariffs/allprice",
			{
				type,
				toAddress,
				fromAddress,
				parcels,
				items,
			},
			{
				headers: {
					Authorization: "Bearer Secret Key", // Replace with your actual API key
					"Content-Type": "application/json",
				},
			}
		);

		res.json(response.data); // Send the shipment rates to the frontend
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to fetch shipment rates" });
	}
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
