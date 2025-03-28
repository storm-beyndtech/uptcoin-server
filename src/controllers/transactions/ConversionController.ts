import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../../models/userModel";
import { Coin } from "../../models/coinModel";
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
		const fromPrice = from === "USDT" ? 1 : coinCache[from].price;
    const toPrice = to === "USDT" ? 1 : coinCache[to].price;

		if (!fromPrice || !toPrice) {
			return res.status(400).json({ message: "Real-time price data not available" });
		}

		// Fetch conversion fee from the database
		const coinData = await Coin.findOne({ symbol: from }, { fee: 1 });
		const feePercentage = coinData?.conversionFee || 0; 

		// Calculate the fee and adjusted amount
		const feeAmount = (amount * feePercentage) / 100;
		const netAmount = amount - feeAmount;

		// Handle price conversion
		let convertedAmount;
		if (from === "USDT") {
			// Convert directly using the `to` price if `from` is USDT
			convertedAmount = netAmount / toPrice;
		} else {
			// Convert using (fromAmount * fromPrice) / toPrice
			convertedAmount = (netAmount * fromPrice) / toPrice;
		}

		// Update user assets
		const updatedUser = await User.findByIdAndUpdate(
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
			}
		);

		// Log the conversion in the Conversion collection
		await Conversion.create({
			userId: new Types.ObjectId(userId),
			fee: feeAmount,
			from: { symbol: from, amount, price: fromPrice },
			to: { symbol: to, amount: convertedAmount, price: toPrice },
		});

		return res.status(200).json({
			message: "Conversion successful",
			convertedAmount,
			fee: feeAmount,
			updatedAssets: updatedUser?.assets,
		});
	} catch (error) {
		console.error("Conversion error:", error);
		return res.status(500).json({ message: "Server error", error });
	}
};
