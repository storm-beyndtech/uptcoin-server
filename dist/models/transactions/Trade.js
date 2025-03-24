"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TradeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["buy", "sell"], required: true },
    orderType: { type: String, enum: ["market", "limit"], required: true },
    symbol: { type: String, required: true },
    price: { type: Number },
    limitPrice: { type: Number },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ["pending", "executed", "canceled", "rejected"], default: "pending" },
}, { timestamps: true });
const Trade = (0, mongoose_1.model)("Trade", TradeSchema);
exports.default = Trade;
