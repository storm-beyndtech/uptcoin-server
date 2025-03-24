import { Request, Response } from "express";
import User from "../../models/userModel";

// Convert assets from one currency to another within the user's account
export const convertAsset = async (req: Request, res: Response) => {
	try {
		const { userId, amount, fromCurrency, toCurrency, conversionRate } = req.body;

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });
		if (!user.assets) return res.status(400).json({ message: "User assets not found" });

		const fromAsset = user.assets.find((asset) => asset.symbol === fromCurrency);
		const toAsset = user.assets.find((asset) => asset.symbol === toCurrency);

		if (!fromAsset) return res.status(400).json({ message: "Source asset not found" });
		if (!toAsset) return res.status(400).json({ message: "Destination asset not found" });
		if (fromAsset.spot < amount) {
			return res.status(400).json({ message: "Insufficient balance" });
		}

		const convertedAmount = amount * conversionRate;

		await User.findByIdAndUpdate(
			userId,
			{
				$inc: {
					"assets.$[fromElem].spot": -amount,
					"assets.$[toElem].spot": convertedAmount,
				},
			},
			{
				arrayFilters: [{ "fromElem.symbol": fromCurrency }, { "toElem.symbol": toCurrency }],
				new: true,
			},
		);

		res.status(200).json({ message: "Conversion successful", convertedAmount });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};
