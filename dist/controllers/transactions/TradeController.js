"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTrades = exports.getUserTrades = exports.cancelTrade = exports.executeTradeController = exports.placeTrade = void 0;
const mongoose_1 = require("mongoose");
const Trade_1 = __importDefault(require("../../models/transactions/Trade"));
const tradeEngine_1 = require("../../services/tradeEngine");
// Place a trade (Buy/Sell)
const placeTrade = async (req, res) => {
    try {
        const { userId, orderType, action, symbol, limitPrice, price, quantity } = req.body;
        if (!userId || !orderType || !symbol || !action) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        let total = 0;
        if (orderType === "limit") {
        }
        const newTrade = new Trade_1.default({
            userId,
            orderType,
            symbol,
            price: price || null,
            limitPrice: limitPrice || null,
            quantity,
            status: "pending",
        });
        await newTrade.save();
        res.status(201).json({ message: "Trade placed successfully", trade: newTrade });
    }
    catch (error) {
        console.error("Error placing trade:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.placeTrade = placeTrade;
// Execute a trade (Manual/Admin trigger)
const executeTradeController = async (req, res) => {
    const { tradeId } = req.params;
    try {
        const trade = await Trade_1.default.findById(tradeId);
        if (!trade)
            return res.status(404).json({ message: "Trade not found" });
        if (trade.status !== "pending") {
            return res.status(400).json({ message: "Only pending trades can be executed" });
        }
        const success = await (0, tradeEngine_1.executeTrade)(trade);
        if (!success) {
            return res.status(500).json({ message: "Trade execution failed" });
        }
        res.status(200).json({ message: "Trade executed successfully", trade });
    }
    catch (error) {
        console.error("Error executing trade:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.executeTradeController = executeTradeController;
// Cancel a trade (Only if pending)
const cancelTrade = async (req, res) => {
    try {
        const { tradeId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(tradeId))
            return res.status(400).json({ message: "Invalid trade ID" });
        const trade = await Trade_1.default.findById(tradeId);
        if (!trade)
            return res.status(404).json({ message: "Trade not found" });
        if (trade.status !== "pending") {
            return res.status(400).json({ message: "Only pending trades can be canceled" });
        }
        trade.status = "canceled";
        await trade.save();
        res.status(200).json({ message: "Trade canceled successfully", trade });
    }
    catch (error) {
        console.error("Error canceling trade:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.cancelTrade = cancelTrade;
// Get all trades for a user
const getUserTrades = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(userId))
            return res.status(400).json({ message: "Invalid user ID" });
        const trades = await Trade_1.default.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(trades);
    }
    catch (error) {
        console.error("Error fetching trades:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getUserTrades = getUserTrades;
// Get all trades (Admin)
const getAllTrades = async (_req, res) => {
    try {
        const trades = await Trade_1.default.find().sort({ createdAt: -1 });
        res.status(200).json(trades);
    }
    catch (error) {
        console.error("Error fetching all trades:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllTrades = getAllTrades;
