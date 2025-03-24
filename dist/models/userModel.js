"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Default assets with zero balances
const defaultAssets = [
    { symbol: "BTC", funding: 0, spot: 0, staking: 0, name: "Bitcoin", address: "", network: "BTC" },
    { symbol: "ETH", funding: 0, spot: 0, staking: 0, name: "Ethereum", address: "", network: "ERC20" },
    { symbol: "USDT", funding: 0, spot: 0, staking: 0, name: "Tether", address: "", network: "ERC20" },
    { symbol: "ATOM", funding: 0, spot: 0, staking: 0, name: "Cosmos", address: "", network: "ATOM" },
    { symbol: "SOL", funding: 0, spot: 0, staking: 0, name: "Solana", address: "", network: "SOL" },
];
// Create the Mongoose Schema
const UserSchema = new mongoose_1.Schema({
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: String },
    phone: { type: String },
    country: { type: String },
    documentType: { type: String },
    documentFront: { type: String },
    documentBack: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referral: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    tradingStatus: { type: String, default: "None" },
    tradingLevel: { type: String, default: "None" },
    tradingLimit: { type: String, default: "None" },
    assets: {
        type: [
            {
                symbol: { type: String },
                funding: { type: Number },
                spot: { type: Number },
                staking: { type: Number },
                name: { type: String },
                address: { type: String },
                network: { type: String },
            },
        ],
        default: defaultAssets,
    },
    disabled: { type: Boolean, default: false },
}, { timestamps: true });
// Create and Export the Model
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;
