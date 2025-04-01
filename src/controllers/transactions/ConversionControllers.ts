import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../../models/userModel";
import { coinCache } from "../../services/cryptoService";
import Conversion from "../../models/transactions/Conversion";

export const convertAsset = async (req: Request, res: Response) => {
	try {
		const { userId, amount, from, to } = req.body;

		// Validate user existence
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });
		if (!user.assets) return res.status(400).json({ message: "User assets not found" });

		// Validate source and destination assets
		const fromAsset = user.assets.find((asset) => asset.symbol === from);
		const toAsset = user.assets.find((asset) => asset.symbol === to);

		if (!fromAsset) return res.status(400).json({ message: "Source asset not found" });
		if (!toAsset) return res.status(400).json({ message: "Destination asset not found" });
		if (fromAsset.spot < amount) return res.status(400).json({ message: "Insufficient balance" });

		// Get real-time prices from coinCache
		const fromCoinRT = coinCache[from];
		const toCoinRT = coinCache[to];

		if (!fromCoinRT || !toCoinRT) {
			return res.status(400).json({ message: "Real-time price data not available" });
		}

		if (fromCoinRT.price === 0 || toCoinRT.price === 0) {
			return res.status(400).json({ message: "Real-time price data not available" });
		}

		// Calculate the fee and adjusted amount
		const netAmount = amount - fromCoinRT.conversionFee;

		// Handle price conversion
		let convertedAmount;
		if (from === "USDT") {
			// Convert directly using the `to` price if `from` is USDT
			convertedAmount = netAmount / toCoinRT.price;
		} else {
			// Convert using (fromAmount * fromPrice) / toPrice
			convertedAmount = (netAmount * fromCoinRT.price) / toCoinRT.price;
		}

		// Update user assets
		await User.findByIdAndUpdate(
			userId,
			{
				$inc: {
					"assets.$[fromElem].spot": -amount,
					"assets.$[toElem].spot": convertedAmount,
				},
			},
			{
				arrayFilters: [{ "fromElem.symbol": from }, { "toElem.symbol": to }],
				new: true,
			},
		);

		// Log the conversion in the Conversion collection
		await Conversion.create({
			userId: new Types.ObjectId(userId),
			fee: fromCoinRT.conversionFee,
			from: { symbol: from, amount, price: fromCoinRT.price },
			to: { symbol: to, amount: convertedAmount, price: toCoinRT.price },
		});

		return res.status(200).json({
			message: "Conversion successful",
		});
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

// Get all conversions for a user
export const getUserConversions = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user ID" });

		const conversion = await Conversion.find({ userId }).sort({ createdAt: -1 });
		res.status(200).json(conversion);
	} catch (error) {
		console.error("Error fetching conversions:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
