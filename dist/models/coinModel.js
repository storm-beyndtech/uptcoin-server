"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coin = void 0;
const mongoose_1 = require("mongoose");
const CoinSchema = new mongoose_1.Schema({
    symbol: { type: String, required: true },
    margin: { type: Number, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    network: { type: String, required: true },
    transfer: { type: Boolean, required: true },
    deposit: { type: Boolean, required: true },
    withdraw: { type: Boolean, required: true },
    minWithdraw: { type: Number, required: true },
    withdrawalFee: { type: Number, required: true },
    minDeposit: { type: Number, required: true },
    conversionFee: { type: Number, required: true },
});
exports.Coin = (0, mongoose_1.model)('Coin', CoinSchema);
