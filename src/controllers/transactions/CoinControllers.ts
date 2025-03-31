import { Request, Response } from "express";
import { Coin, ICoin } from "../../models/coinModel";

// Get all coins
export const getCoins = async (req: Request, res: Response): Promise<void> => {
	try {
		const coins: ICoin[] = await Coin.find();
		res.status(200).json(coins);
	} catch (error) {
		res.status(500).json({ message: (error as Error).message });
	}
};

// Get a single coin by symbol
export const getCoinBySymbol = async (req: Request, res: Response): Promise<void> => {
	try {
		const coin: ICoin | null = await Coin.findOne({ symbol: req.params.symbol.toUpperCase() });
		if (!coin) {
			res.status(404).json({ message: "Coin not found" });
			return;
		}
		res.status(200).json(coin);
	} catch (error) {
		res.status(500).json({ message: (error as Error).message });
	}
};

// Add a new coin
export const addCoin = async (req: Request, res: Response): Promise<void> => {
	try {
		const { symbol, name, address, network, minWithdraw, minDeposit, withdrawalFee } = req.body;

		if (
			!symbol ||
			!name ||
			!address ||
			!network ||
			minWithdraw == null ||
			minDeposit == null ||
			withdrawalFee == null
		) {
			res.status(400).json({ message: "Missing required fields" });
			return;
		}

		const existingCoin = await Coin.findOne({ symbol });
		if (existingCoin) {
			res.status(400).json({ message: "Coin already exists" });
			return;
		}

		const newCoin = new Coin(req.body);
		await newCoin.save();

		res.status(201).json({ message: "Coin added successfully", coin: newCoin });
	} catch (error) {
		res.status(500).json({ message: (error as Error).message });
	}
};

// Update a coin by symbol
export const updateCoin = async (req: Request, res: Response): Promise<void> => {
	try {
		const updatedCoin = await Coin.findOneAndUpdate({ symbol: req.params.symbol.toUpperCase() }, req.body, {
			new: true,
		});

		if (!updatedCoin) {
			res.status(404).json({ message: "Coin not found" });
			return;
		}

		res.status(200).json({ message: "Coin updated successfully", updatedCoin });
	} catch (error) {
		res.status(500).json({ message: (error as Error).message });
	}
};

// Delete a coin by symbol
export const deleteCoin = async (req: Request, res: Response): Promise<void> => {
	try {
		const deletedCoin = await Coin.findOneAndDelete({ symbol: req.params.symbol.toUpperCase() });

		if (!deletedCoin) {
			res.status(404).json({ message: "Coin not found" });
			return;
		}

		res.status(200).json({ message: "Coin deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: (error as Error).message });
	}
};
