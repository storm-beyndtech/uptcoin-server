import { Request, Response } from "express";
import User from "../../models/userModel";

interface TransferRequestBody {
	userId: string;
	amount: number;
	symbol: string;
	from: "spot" | "funding";
	to: "spot" | "funding";
}

// Transfer assets between Spot and Funding
export const transferAsset = async (req: Request, res: Response) => {
	try {
		const { userId, amount, symbol, from, to } = req.body as TransferRequestBody;

		//Some Validation
		if (from !== "spot" && from !== "funding") {
			return res.status(400).json({ message: "Invalid source wallet" });
    }
    
		if (to !== "spot" && to !== "funding") {
			return res.status(400).json({ message: "Invalid destination wallet" });
    }
    
		if (from === to) {
			return res.status(400).json({ message: "Source and destination wallets cannot be the same" });
		}

		//Check if user & user assets available
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });
		if (!user.assets) return res.status(400).json({ message: "User assets not found" });

		//Check for asset specific ass and sufficient balance
		const asset = user.assets.find((asset) => asset.symbol === symbol);
		if (!asset) return res.status(400).json({ message: "Asset not found" });
		if (asset[from] < amount) {
			return res.status(400).json({ message: "Insufficient balance" });
		}

		await User.findByIdAndUpdate(
			userId,
			{
				$inc: {
					[`assets.$[elem].${from}`]: -amount,
					[`assets.$[elem].${to}`]: amount,
				},
			},
			{
				arrayFilters: [{ "elem.symbol": symbol }],
				new: true,
			},
		);

		res.status(200).json({ message: "Transfer successful" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};
