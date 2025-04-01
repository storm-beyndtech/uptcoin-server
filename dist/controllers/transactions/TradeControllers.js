"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTrades = exports.getUserTrades = exports.cancelTrade = exports.executeTradeController = exports.placeTrade = void 0;
const mongoose_1 = require("mongoose");
const Trade_1 = __importDefault(require("../../models/transactions/Trade"));
const tradeEngine_1 = require("../../services/tradeEngine");
const userModel_1 = __importDefault(require("../../models/userModel"));
const cryptoService_1 = require("../../services/cryptoService");
//Handle Buy/Sell
const placeTrade = async (req, res) => {
    try {
        const { userId, orderType, action, symbol, limitPrice, amount, quantity } = req.body;
        // Validate required fields
        if (!userId || !orderType || !symbol || !action) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // Validate action type
        if (!["buy", "sell"].includes(action)) {
            return res.status(400).json({ message: "Invalid action. Must be 'buy' or 'sell'" });
        }
        // Validate order type
        if (!["market", "limit"].includes(orderType)) {
            return res.status(400).json({ message: "Invalid order type. Must be 'market' or 'limit'" });
        }
        // Validate user existence
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!user.assets)
            return res.status(400).json({ message: "User assets not found" });
        // Fetch real-time price for the asset
        const assetData = cryptoService_1.coinCache[symbol];
        if (!assetData || assetData.price === 0) {
            return res.status(400).json({ message: "Real-time price data not available for the asset" });
        }
        const marketPrice = assetData.price;
        // Determine if the user has sufficient balance/assets
        const baseAsset = action === "buy" ? "USDT" : symbol;
        const userAsset = user.assets.find((asset) => asset.symbol === baseAsset);
        if (!userAsset) {
            return res.status(400).json({ message: `User does not own ${baseAsset}` });
        }
        // Calculate required amount based on market price if not provided
        const tradeAmount = amount ?? quantity * marketPrice;
        if (action === "buy" && userAsset.spot < tradeAmount) {
            return res.status(400).json({ message: "Insufficient USDT balance for this trade" });
        }
        if (action === "sell" && userAsset.spot < quantity) {
            return res.status(400).json({ message: `Insufficient ${symbol} balance for this trade` });
        }
        // Create trade object
        let newTrade = new Trade_1.default({
            userId: new mongoose_1.Types.ObjectId(userId),
            action,
            orderType,
            symbol,
            limitPrice,
            amount: tradeAmount,
            quantity,
            status: "pending",
        });
        // Handle market order execution instantly
        if (orderType === "market") {
            newTrade.marketPrice = marketPrice;
            newTrade.status = "executed";
            // Update user's assets accordingly
            if (action === "buy") {
                await userModel_1.default.findByIdAndUpdate(userId, {
                    $inc: {
                        "assets.$[usdtElem].spot": -tradeAmount,
                        "assets.$[symbolElem].spot": quantity,
                    },
                }, {
                    arrayFilters: [{ "usdtElem.symbol": "USDT" }, { "symbolElem.symbol": symbol }],
                });
            }
            else {
                await userModel_1.default.findByIdAndUpdate(userId, {
                    $inc: {
                        "assets.$[symbolElem].spot": -quantity,
                        "assets.$[usdtElem].spot": tradeAmount,
                    },
                }, {
                    arrayFilters: [{ "symbolElem.symbol": symbol }, { "usdtElem.symbol": "USDT" }],
                });
            }
        }
        else if (orderType === "trade") {
            if (!tradeEngine_1.pendingLimitOrders.has(symbol))
                tradeEngine_1.pendingLimitOrders.set(symbol, []);
            tradeEngine_1.pendingLimitOrders.get(symbol).push(newTrade);
        }
        // Save trade
        await newTrade.save();
        res.status(201).json({ message: "Trade placed successfully", trade: newTrade });
    }
    catch (error) {
        console.error("Error placing trade:", error);
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
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
