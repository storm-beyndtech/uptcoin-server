"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTrade = exports.loadPendingOrders = exports.handlePriceUpdate = void 0;
const Trade_1 = __importDefault(require("../models/transactions/Trade"));
const userModel_1 = __importDefault(require("../models/userModel"));
const pendingLimitOrders = new Map();
//Handle Price Update
const handlePriceUpdate = async (priceData) => {
    const { symbol, price } = priceData;
    if (pendingLimitOrders.has(symbol)) {
        let orders = pendingLimitOrders.get(symbol);
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            if ((order.action === "buy" && price <= order.limitPrice) ||
                (order.action === "sell" && price >= order.limitPrice)) {
                console.log(`Executing ${order.action} order for ${order.userId} at ${price}`);
                await Trade_1.default.findByIdAndUpdate(order._id, {
                    status: "executed",
                    limitPrice: price,
                });
                orders.splice(i, 1);
                i--;
            }
        }
        if (orders.length === 0) {
            pendingLimitOrders.delete(symbol);
        }
    }
};
exports.handlePriceUpdate = handlePriceUpdate;
//Load Pending Limit Orders
const loadPendingOrders = async () => {
    const pendingOrders = await Trade_1.default.find({ status: "pending" });
    pendingOrders.forEach((order) => {
        if (!pendingLimitOrders.has(order.symbol)) {
            pendingLimitOrders.set(order.symbol, []);
        }
        pendingLimitOrders.get(order.symbol).push(order);
    });
    console.log("Loaded Limits.", pendingLimitOrders, pendingOrders);
};
exports.loadPendingOrders = loadPendingOrders;
//Execute Limit Trades
const executeTrade = async (trade) => {
    try {
        // Fetch user from database
        const user = await userModel_1.default.findById(trade.userId);
        if (!user)
            throw new Error("User not found");
        // Find user's USDT balance And Trade Asset
        const usdtBalance = user.assets.find((asset) => asset.symbol === "USDT");
        const tradeAsset = user.assets.find((asset) => asset.symbol === trade.symbol);
        // Ensure assets exist
        if (!usdtBalance || !tradeAsset)
            throw new Error("Asset balances not found");
        // Handle Buy Order
        if (trade.orderType === "buy") {
            const cost = trade.price * trade.quantity;
            // Check if user has enough USDT
            if (usdtBalance.spot < cost) {
                console.log(`Insufficient USDT balance for user ${trade.userId}`);
                return false;
            }
            // Deduct USDT and add purchased asset
            usdtBalance.spot -= cost;
            tradeAsset.spot += trade.quantity;
        }
        // Handle Sell Order
        if (trade.orderType === "sell") {
            // Check if user has enough of the asset
            if (tradeAsset.spot < trade.quantity) {
                console.log(`Insufficient ${tradeAsset.symbol} balance for user ${trade.userId}`);
                return false;
            }
            // Deduct asset and credit USDT
            tradeAsset.spot -= trade.quantity;
            usdtBalance.spot += trade.price * trade.quantity;
        }
        // Save updated user data to database
        await user.save();
        // Mark trade as executed in database
        await Trade_1.default.findByIdAndUpdate(trade._id, { status: "executed", executedAt: new Date() });
        console.log(`Trade ${trade._id} executed successfully.`);
        return true;
    }
    catch (error) {
        console.error("Error executing trade:", error);
        return false;
    }
};
exports.executeTrade = executeTrade;
