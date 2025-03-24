"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoin = exports.updateCoin = exports.createCoin = exports.getCoinBySymbol = exports.getAllCoins = void 0;
const coinModel_1 = require("../models/coinModel");
// Get all coins
const getAllCoins = async (req, res) => {
    try {
        const coins = await coinModel_1.Coin.find();
        res.status(200).json(coins);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch coins" });
    }
};
exports.getAllCoins = getAllCoins;
// Get a single coin by symbol
const getCoinBySymbol = async (req, res) => {
    try {
        const coin = await coinModel_1.Coin.findOne({ symbol: req.params.symbol });
        if (!coin) {
            return res.status(404).json({ message: "Coin not found" });
        }
        res.status(200).json(coin);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: `Error fetching coin: ${error.message}` });
        }
        else {
            console.log(error);
        }
    }
};
exports.getCoinBySymbol = getCoinBySymbol;
// Create a new coin
const createCoin = async (req, res) => {
    const coin = req.body;
    try {
        const newCoin = await coinModel_1.Coin.create(coin);
        res.status(201).json(newCoin);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: `Error creating coin: ${error.message}` });
        }
        else {
            console.log(error);
        }
    }
};
exports.createCoin = createCoin;
// Update a coin by symbol
const updateCoin = async (req, res) => {
    try {
        const updatedCoin = await coinModel_1.Coin.findOneAndUpdate({ symbol: req.params.symbol }, req.body, { new: true });
        if (!updatedCoin) {
            return res.status(404).json({ message: "Coin not found" });
        }
        res.status(200).json(updatedCoin);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: `Error updating coin: ${error.message}` });
        }
        else {
            console.log(error);
        }
    }
};
exports.updateCoin = updateCoin;
// Delete a coin by symbol
const deleteCoin = async (req, res) => {
    try {
        const deletedCoin = await coinModel_1.Coin.findOneAndDelete({ symbol: req.params.symbol });
        if (!deletedCoin) {
            return res.status(404).json({ message: "Coin not found" });
        }
        res.status(200).json({ message: "Coin deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting coin" });
    }
};
exports.deleteCoin = deleteCoin;
