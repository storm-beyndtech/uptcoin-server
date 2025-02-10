"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// Middlewares
const authMiddleware_1 = require("./middlewares/authMiddleware");
const emailConfig_1 = require("./services/emailConfig");
// Initialize Express App
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MongoDB Connection
(async function () {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URL || "");
        console.log("Connected to MongoDB...");
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error Connecting to MongoDB:", error.message);
        }
        process.exit(1);
    }
})();
// Verify Email Transporter
(async () => {
    await (0, emailConfig_1.verifyTransporter)();
})();
// Define Routes
app.get("/", (req, res) => {
    res.send("Storm's Server🔥");
});
app.use("/api/auth", (0, authMiddleware_1.authMiddleware)(), authRoutes_1.default);
// Route Not Found Handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Storm's Server's 🏃🚀.. ${PORT}`));
exports.default = app;
