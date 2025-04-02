import { Request, Response } from "express";
import { Types } from "mongoose";
import Trade from "../../models/transactions/Trade";
import { executeTrade, pendingLimitOrders } from "../../services/tradeEngine";
import User from "../../models/userModel";
import { coinCache } from "../../services/cryptoService";

//Handle Buy/Sell
export const placeTrade = async (req: Request, res: Response) => {
	try {
		const { userId, orderType, action, symbol, limitPrice, amount, quantity } = req.body;

		// Validate required fields
		if (!userId || !orderType || !symbol || !action) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		// Validate action type
		if (!["buy", "sell"].includes(action)) {
			return res.status(400).json({ message: "Invalid action. Must be 'buy' or 'sell'" });
		}

		// Validate order type
		if (!["market", "limit"].includes(orderType)) {
			return res.status(400).json({ message: "Invalid order type. Must be 'market' or 'limit'" });
		}

		// Validate user existence
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });
		if (!user.assets) return res.status(400).json({ message: "User assets not found" });
		if (user.isTradeSuspended)
			return res
				.status(400)
				.json({ message: "You've been suspended from trading, try again after 24 hours" });

		// Fetch real-time price for the asset
		const assetData = coinCache[symbol];
		if (!assetData || assetData.price === 0) {
			return res.status(400).json({ message: "Real-time price data not available for the asset" });
		}

		const marketPrice = assetData.price;

		// Determine if the user has sufficient balance/assets
		const baseAsset = action === "buy" ? "USDT" : symbol;
		const userAsset = user.assets.find((asset) => asset.symbol === baseAsset);

		if (!userAsset) {
			return res.status(400).json({ message: `User does not own ${baseAsset}` });
		}

		// Calculate required amount based on market price if not provided
		const tradeAmount = amount ?? quantity * marketPrice;

		if (action === "buy" && userAsset.spot < tradeAmount) {
			return res.status(400).json({ message: "Insufficient USDT balance for this trade" });
		}

		if (action === "sell" && userAsset.spot < quantity) {
			return res.status(400).json({ message: `Insufficient ${symbol} balance for this trade` });
		}

		// Create trade object
		let newTrade = new Trade({
			userId: new Types.ObjectId(userId),
			action,
			orderType,
			symbol,
			limitPrice,
			amount: tradeAmount,
			quantity,
			status: "pending",
		});

		// Handle market order execution instantly
		if (orderType === "market") {
			newTrade.marketPrice = marketPrice;
			newTrade.status = "executed";

			// Update user's assets accordingly
			if (action === "buy") {
				await User.findByIdAndUpdate(
					userId,
					{
						$inc: {
							"assets.$[usdtElem].spot": -tradeAmount,
							"assets.$[symbolElem].spot": quantity,
						},
					},
					{
						arrayFilters: [{ "usdtElem.symbol": "USDT" }, { "symbolElem.symbol": symbol }],
					},
				);
			} else {
				await User.findByIdAndUpdate(
					userId,
					{
						$inc: {
							"assets.$[symbolElem].spot": -quantity,
							"assets.$[usdtElem].spot": tradeAmount,
						},
					},
					{
						arrayFilters: [{ "symbolElem.symbol": symbol }, { "usdtElem.symbol": "USDT" }],
					},
				);
			}
		} else if (orderType === "trade") {
			if (!pendingLimitOrders.has(symbol)) pendingLimitOrders.set(symbol, []);
			pendingLimitOrders.get(symbol).push(newTrade);
		}

		// Save trade
		await newTrade.save();

		res.status(201).json({ message: "Trade placed successfully", trade: newTrade });
	} catch (error: any) {
		console.error("Error placing trade:", error);
		res.status(500).json({ message: error.message });
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
	} catch (error: any) {
		console.error("Error executing trade:", error);
		res.status(500).json({ message: error.message });
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
	} catch (error: any) {
		console.error("Error canceling trade:", error);
		res.status(500).json({ message: error.message });
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

//Update Trader Status
export const updateTraderStatus = async (req: Request, res: Response) => {
	try {
		const { tradingStatus, userId, isTradeSuspended } = req.body;

		if (!Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ message: "Invalid user ID" });
		}

		if (!tradingStatus) {
			return res.status(400).json({ message: "Invalid Trading Status" });
		}

		if (isTradeSuspended === undefined) {
			return res.status(400).json({ message: "Please Provide the right suspended value" });
		}

		// Find user and update their trader status
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ tradingStatus, isTradeSuspended },
			{ new: true, runValidators: true },
		);

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({ message: "Trader status updated successfully", user: updatedUser });
	} catch (error) {
		console.error("Error updating trader status:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
