"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ConversionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    fee: { type: Number, required: true },
    from: {
        type: {
            symbol: String,
            amount: Number,
            price: Number,
        },
        required: true,
    },
    to: {
        type: {
            symbol: String,
            amount: Number,
            price: Number,
        },
        required: true,
    },
}, { timestamps: true });
const Conversion = (0, mongoose_1.model)("Conversion", ConversionSchema);
exports.default = Conversion;
