import { Request, Response } from "express";
import { Types } from "mongoose";
import Trade from "../../models/transactions/Trade";
import { executeTrade } from "../../services/tradeEngine";

// Place a trade (Buy/Sell)
export const placeTrade = async (req: Request, res: Response) => {
	try {
		const { userId, orderType, action, symbol, limitPrice, price, quantity } = req.body;

		if (!userId || !orderType || !symbol || !action) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		let total = 0;
		if (orderType === "limit") {
		}

		const newTrade = new Trade({
			userId,
			orderType,
			symbol,
			price: price || null,
			limitPrice: limitPrice || null,
			quantity,
			status: "pending",
		});

		await newTrade.save();
		res.status(201).json({ message: "Trade placed successfully", trade: newTrade });
	} catch (error) {
		console.error("Error placing trade:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Execute a trade (Manual/Admin trigger)
export const executeTradeController = async (req: Request, res: Response) => {
  const { tradeId } = req.params;

	try {
		const trade = await Trade.findById(tradeId);
		if (!trade) return res.status(404).json({ message: "Trade not found" });

		if (trade.status !== "pending") {
			return res.status(400).json({ message: "Only pending trades can be executed" });
		}

		const success = await executeTrade(trade);
		if (!success) {
			return res.status(500).json({ message: "Trade execution failed" });
		}

		res.status(200).json({ message: "Trade executed successfully", trade });
	} catch (error) {
		console.error("Error executing trade:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Cancel a trade (Only if pending)
export const cancelTrade = async (req: Request, res: Response) => {
	try {
		const { tradeId } = req.params;
		if (!Types.ObjectId.isValid(tradeId)) return res.status(400).json({ message: "Invalid trade ID" });

		const trade = await Trade.findById(tradeId);
		if (!trade) return res.status(404).json({ message: "Trade not found" });

		if (trade.status !== "pending") {
			return res.status(400).json({ message: "Only pending trades can be canceled" });
		}

		trade.status = "canceled";
		await trade.save();
		res.status(200).json({ message: "Trade canceled successfully", trade });
	} catch (error) {
		console.error("Error canceling trade:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Get all trades for a user
export const getUserTrades = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user ID" });

		const trades = await Trade.find({ userId }).sort({ createdAt: -1 });
		res.status(200).json(trades);
	} catch (error) {
		console.error("Error fetching trades:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Get all trades (Admin)
export const getAllTrades = async (_req: Request, res: Response) => {
	try {
		const trades = await Trade.find().sort({ createdAt: -1 });
		res.status(200).json(trades);
	} catch (error) {
		console.error("Error fetching all trades:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
