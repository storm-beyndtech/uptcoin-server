"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAsset = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
// Convert assets from one currency to another within the user's account
const convertAsset = async (req, res) => {
    try {
        const { userId, amount, fromCurrency, toCurrency, conversionRate } = req.body;
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!user.assets)
            return res.status(400).json({ message: "User assets not found" });
        const fromAsset = user.assets.find((asset) => asset.symbol === fromCurrency);
        const toAsset = user.assets.find((asset) => asset.symbol === toCurrency);
        if (!fromAsset)
            return res.status(400).json({ message: "Source asset not found" });
        if (!toAsset)
            return res.status(400).json({ message: "Destination asset not found" });
        if (fromAsset.spot < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        const convertedAmount = amount * conversionRate;
        await userModel_1.default.findByIdAndUpdate(userId, {
            $inc: {
                "assets.$[fromElem].spot": -amount,
                "assets.$[toElem].spot": convertedAmount,
            },
        }, {
            arrayFilters: [{ "fromElem.symbol": fromCurrency }, { "toElem.symbol": toCurrency }],
            new: true,
        });
        res.status(200).json({ message: "Conversion successful", convertedAmount });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.convertAsset = convertAsset;
