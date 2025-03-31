"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoin = exports.updateCoin = exports.addCoin = exports.getCoinBySymbol = exports.getCoins = void 0;
const coinModel_1 = require("../../models/coinModel");
// Get all coins
const getCoins = async (req, res) => {
    try {
        const coins = await coinModel_1.Coin.find();
        res.status(200).json(coins);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCoins = getCoins;
// Get a single coin by symbol
const getCoinBySymbol = async (req, res) => {
    try {
        const coin = await coinModel_1.Coin.findOne({ symbol: req.params.symbol.toUpperCase() });
        if (!coin) {
            res.status(404).json({ message: "Coin not found" });
            return;
        }
        res.status(200).json(coin);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCoinBySymbol = getCoinBySymbol;
// Add a new coin
const addCoin = async (req, res) => {
    try {
        const { symbol, name, address, network, minWithdraw, minDeposit, withdrawalFee } = req.body;
        if (!symbol ||
            !name ||
            !address ||
            !network ||
            minWithdraw == null ||
            minDeposit == null ||
            withdrawalFee == null) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const existingCoin = await coinModel_1.Coin.findOne({ symbol });
        if (existingCoin) {
            res.status(400).json({ message: "Coin already exists" });
            return;
        }
        const newCoin = new coinModel_1.Coin(req.body);
        await newCoin.save();
        res.status(201).json({ message: "Coin added successfully", coin: newCoin });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addCoin = addCoin;
// Update a coin by symbol
const updateCoin = async (req, res) => {
    try {
        const updatedCoin = await coinModel_1.Coin.findOneAndUpdate({ symbol: req.params.symbol.toUpperCase() }, req.body, {
            new: true,
        });
        if (!updatedCoin) {
            res.status(404).json({ message: "Coin not found" });
            return;
        }
        res.status(200).json({ message: "Coin updated successfully", updatedCoin });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateCoin = updateCoin;
// Delete a coin by symbol
const deleteCoin = async (req, res) => {
    try {
        const deletedCoin = await coinModel_1.Coin.findOneAndDelete({ symbol: req.params.symbol.toUpperCase() });
        if (!deletedCoin) {
            res.status(404).json({ message: "Coin not found" });
            return;
        }
        res.status(200).json({ message: "Coin deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteCoin = deleteCoin;
