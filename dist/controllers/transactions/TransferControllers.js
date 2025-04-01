"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTranfers = exports.transferAsset = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const Transfer_1 = __importDefault(require("../../models/transactions/Transfer"));
const mongoose_1 = require("mongoose");
// Transfer assets between Spot and Funding
const transferAsset = async (req, res) => {
    try {
        const { userId, amount, symbol, from, to } = req.body;
        //Some Validation
        if (from !== "spot" && from !== "funding") {
            return res.status(400).json({ message: "Invalid source wallet" });
        }
        if (to !== "spot" && to !== "funding") {
            return res.status(400).json({ message: "Invalid destination wallet" });
        }
        if (from === to) {
            return res.status(400).json({ message: "Source and destination wallets cannot be the same" });
        }
        //Check if user & user assets available
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!user.assets)
            return res.status(400).json({ message: "User assets not found" });
        //Check for asset specific ass and sufficient balance
        const asset = user.assets.find((asset) => asset.symbol === symbol);
        if (!asset)
            return res.status(400).json({ message: "Asset not found" });
        if (asset[from] < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        //Update user asset balance
        await userModel_1.default.findByIdAndUpdate(userId, {
            $inc: {
                [`assets.$[elem].${from}`]: -amount,
                [`assets.$[elem].${to}`]: amount,
            },
        }, {
            arrayFilters: [{ "elem.symbol": symbol }],
            new: true,
        });
        //Save transfer
        const transfer = new Transfer_1.default({ userId, amount, symbol, from, to, status: "approved" });
        await transfer.save();
        res.status(200).json({ message: "Transfer successful" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.transferAsset = transferAsset;
// Get all transfer for a user
const getUserTranfers = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(userId))
            return res.status(400).json({ message: "Invalid user ID" });
        const transfers = await Transfer_1.default.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(transfers);
    }
    catch (error) {
        console.error("Error fetching transfers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getUserTranfers = getUserTranfers;
