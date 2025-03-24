import { Request, Response } from "express";
import { Coin, ICoin } from "../models/coinModel";

// Get all coins
export const getAllCoins = async (req: Request, res: Response) => {
	try {
		const coins = await Coin.find();
		res.status(200).json(coins);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch coins" });
	}
};

// Get a single coin by symbol
export const getCoinBySymbol = async (req: Request, res: Response) => {
	try {
		const coin = await Coin.findOne({ symbol: req.params.symbol });
		if (!coin) {
			return res.status(404).json({ message: "Coin not found" });
		}
		res.status(200).json(coin);
  } catch (error) {
    if (error instanceof Error) {
			res.status(500).json({ message: `Error fetching coin: ${error.message}` });
		} else {
			console.log(error);
		}
	}
};

// Create a new coin
export const createCoin = async (req: Request, res: Response) => {
	const coin: ICoin = req.body;
	try {
		const newCoin = await Coin.create(coin);
		res.status(201).json(newCoin);
	} catch (error) {
    if (error instanceof Error) {
			res.status(500).json({ message: `Error creating coin: ${error.message}` });
		} else {
			console.log(error);
		}
	}
};

// Update a coin by symbol
export const updateCoin = async (req: Request, res: Response) => {
	try {
		const updatedCoin = await Coin.findOneAndUpdate({ symbol: req.params.symbol }, req.body, { new: true });
		if (!updatedCoin) {
			return res.status(404).json({ message: "Coin not found" });
		}
		res.status(200).json(updatedCoin);
  } catch (error) {
    if (error instanceof Error) {
			res.status(500).json({ message: `Error updating coin: ${error.message}` });
		} else {
			console.log(error);
		}
	}
};

// Delete a coin by symbol
export const deleteCoin = async (req: Request, res: Response) => {
	try {
		const deletedCoin = await Coin.findOneAndDelete({ symbol: req.params.symbol });
		if (!deletedCoin) {
			return res.status(404).json({ message: "Coin not found" });
		}
		res.status(200).json({ message: "Coin deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting coin" });
	}
};
