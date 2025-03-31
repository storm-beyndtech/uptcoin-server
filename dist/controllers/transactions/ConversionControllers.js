"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserConversions = exports.convertAsset = void 0;
const mongoose_1 = require("mongoose");
const userModel_1 = __importDefault(require("../../models/userModel"));
const coinModel_1 = require("../../models/coinModel");
const cryptoService_1 = require("../../services/cryptoService");
const Conversion_1 = __importDefault(require("../../models/transactions/Conversion"));
const convertAsset = async (req, res) => {
    try {
        const { userId, amount, from, to } = req.body;
        // Validate user existence
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!user.assets)
            return res.status(400).json({ message: "User assets not found" });
        // Validate source and destination assets
        const fromAsset = user.assets.find((asset) => asset.symbol === from);
        const toAsset = user.assets.find((asset) => asset.symbol === to);
        if (!fromAsset)
            return res.status(400).json({ message: "Source asset not found" });
        if (!toAsset)
            return res.status(400).json({ message: "Destination asset not found" });
        if (fromAsset.spot < amount)
            return res.status(400).json({ message: "Insufficient balance" });
        // Get real-time prices from coinCache
        const fromPrice = from === "USDT" ? 1 : cryptoService_1.coinCache[from].price;
        const toPrice = to === "USDT" ? 1 : cryptoService_1.coinCache[to].price;
        if (!fromPrice || !toPrice) {
            return res.status(400).json({ message: "Real-time price data not available" });
        }
        // Fetch conversion fee from the database
        const coinData = await coinModel_1.Coin.findOne({ symbol: from }, { fee: 1 });
        const feePercentage = coinData?.conversionFee || 0;
        // Calculate the fee and adjusted amount
        const feeAmount = (amount * feePercentage) / 100;
        const netAmount = amount - feeAmount;
        // Handle price conversion
        let convertedAmount;
        if (from === "USDT") {
            // Convert directly using the `to` price if `from` is USDT
            convertedAmount = netAmount / toPrice;
        }
        else {
            // Convert using (fromAmount * fromPrice) / toPrice
            convertedAmount = (netAmount * fromPrice) / toPrice;
        }
        // Update user assets
        const updatedUser = await userModel_1.default.findByIdAndUpdate(userId, {
            $inc: {
                "assets.$[fromElem].spot": -amount,
                "assets.$[toElem].spot": convertedAmount,
            },
        }, {
            arrayFilters: [{ "fromElem.symbol": from }, { "toElem.symbol": to }],
            new: true,
        });
        // Log the conversion in the Conversion collection
        await Conversion_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            fee: feeAmount,
            from: { symbol: from, amount, price: fromPrice },
            to: { symbol: to, amount: convertedAmount, price: toPrice },
        });
        return res.status(200).json({
            message: "Conversion successful"
        });
    }
    catch (error) {
        console.error("Conversion error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};
exports.convertAsset = convertAsset;
// Get all conversions for a user
const getUserConversions = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(userId))
            return res.status(400).json({ message: "Invalid user ID" });
        const conversion = await Conversion_1.default.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(conversion);
    }
    catch (error) {
        console.error("Error fetching conversions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getUserConversions = getUserConversions;
