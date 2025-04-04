import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
// Routes
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import coinRoutes from "./routes/coinRoutes";
import adminRoutes from "./routes/adminRoutes";

// Middlewares
import { authMiddleware } from "./middlewares/authMiddleware";
import { verifyTransporter } from "./services/emailConfig";
import { startCryptoWebSocket, handleCryptoWebSocket } from "./services/cryptoService";
import { loadPendingOrders } from "./services/tradeEngine";
// import { seedDatabase } from "./scripts/seedDatabase";

// Initialize Express App
const app = express();
const server = http.createServer(app);

// middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
(async function () {
	try {
		await mongoose.connect(process.env.MONGODB_URL || "");
    console.log("Connected to MongoDB...");
    
    // seedDatabase()

		// Start CryptoCompare WebSocket
		startCryptoWebSocket();

		// WebSocket for frontend clients
		handleCryptoWebSocket(server);

		//Fetch all pending trades
		loadPendingOrders();
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error Connecting to MongoDB:", error.message);
		}
		process.exit(1);
	}
})();

// Verify Email Transporter
verifyTransporter();

// Define Routes
app.get("/", (req, res) => {
	res.send("Storm's Server🔥");
});

app.use("/api/auth", authMiddleware(), authRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/admin", adminRoutes);

// Route Not Found Handler
app.use((req, res) => {
	res.status(404).json({ message: "Route not found" });
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Storm's Server's 🏃🚀.. ${PORT}`));

export default app;
