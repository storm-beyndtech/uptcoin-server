import Trade from "../models/transactions/Trade";
import User from "../models/userModel";

export const pendingLimitOrders = new Map();

// Handle Price Update
export const handlePriceUpdate = async (priceData: { symbol: string; price: number }) => {
	const { symbol, price } = priceData;

	if (pendingLimitOrders.has(symbol)) {
		let orders = pendingLimitOrders.get(symbol);

		for (let i = 0; i < orders.length; i++) {
			const order = orders[i];

			if (
				(order.action === "buy" && price <= order.limitPrice) ||
				(order.action === "sell" && price >= order.limitPrice)
			) {
				console.log(`Executing ${order.action} order for ${order.userId} at ${price}`);

				// Execute trade
				const success = await executeTrade(order);

				if (success) {
					// Remove from pending orders list
					orders.splice(i, 1);
					i--; // Adjust index since we removed an element
				}
			}
		}

		// If no more pending orders for this symbol, remove from map
		if (orders.length === 0) {
			pendingLimitOrders.delete(symbol);
		}
	}
};

// Load Pending Limit Orders
export const loadPendingOrders = async () => {
	const pendingOrders = await Trade.find({ status: "pending" });

	pendingOrders.forEach((order) => {
		if (!pendingLimitOrders.has(order.symbol)) {
			pendingLimitOrders.set(order.symbol, []);
		}
		pendingLimitOrders.get(order.symbol).push(order);
	});

	console.log("Loaded Limit Orders:", pendingLimitOrders);
};

// Execute Trade
export const executeTrade = async (trade: any): Promise<boolean> => {
	try {
		// Fetch user from database
		const user = await User.findById(trade.userId);
		if (!user) throw new Error("User not found");

		// Find user's USDT balance and trade asset
		const usdtBalance = user.assets.find((asset) => asset.symbol === "USDT");
		const tradeAsset = user.assets.find((asset) => asset.symbol === trade.symbol);

		// Ensure assets exist
		if (!usdtBalance || !tradeAsset) throw new Error("Asset balances not found");

		// Handle Buy Order
		if (trade.action === "buy") {
			const cost = trade.limitPrice * trade.quantity;

			// Check if user has enough USDT
			if (usdtBalance.spot < cost) {
				console.warn(`Insufficient USDT balance for user: ${trade.userId}`);
				return false;
			}

			// Deduct USDT and add purchased asset
			usdtBalance.spot -= cost;
			tradeAsset.spot += trade.quantity;
		}

		// Handle Sell Order
		if (trade.action === "sell") {
			// Check if user has enough of the asset
			if (tradeAsset.spot < trade.quantity) {
				console.warn(`Insufficient ${tradeAsset.symbol} balance for user: ${trade.userId}`);
				return false;
			}

			// Deduct asset and credit USDT
			tradeAsset.spot -= trade.quantity;
			usdtBalance.spot += trade.limitPrice * trade.quantity;
		}

		// Save updated user data to database
		await user.save();

		// Mark trade as executed in database
		await Trade.findByIdAndUpdate(trade._id, { status: "executed", executedAt: new Date() });

		console.log(`Trade ${trade._id} executed successfully.`);
		return true;
	} catch (error) {
		console.error("Error executing trade:", error);
		return false;
	}
};
