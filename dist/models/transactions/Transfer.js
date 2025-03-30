"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TransferSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    symbol: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    from: { type: String, enum: ["spot", "funding"], required: true },
    to: { type: String, enum: ["spot", "funding"], required: true },
}, { timestamps: true });
const Transfer = (0, mongoose_1.model)("Transfer", TransferSchema);
exports.default = Transfer;
