"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DepositSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    address: { type: String, required: true },
    network: { type: String, required: true },
}, { timestamps: true });
const Deposit = (0, mongoose_1.model)("Deposit", DepositSchema);
exports.default = Deposit;
