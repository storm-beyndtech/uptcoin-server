import { Request, Response } from "express";
import User from "../models/userModel";
import { Coin } from "../models/coinModel";
import { uploadKycImage } from "../utils/uploadHelper";

// ✅ Add Asset to User
export const addAsset = async (req: Request, res: Response) => {
	try {
		const { userId, symbol } = req.body;

		// Validate input
		if (!userId || !symbol)
			return res.status(400).json({ message: "User ID and asset symbol are required." });

		// Find user
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found." });

		// Check if asset already exists
		if (user.assets.some((asset) => asset.symbol === symbol)) {
			return res.status(400).json({ message: "Asset already exists in user account." });
		}

		// Fetch coin details
		const coin = await Coin.findOne({ symbol });
		if (!coin) return res.status(404).json({ message: "Coin not found." });

		// Add asset with default values
		const newAsset = {
			symbol: coin.symbol,
			name: coin.name,
			network: coin.network,
			funding: 0,
			spot: 0,
			address: "",
			status: "activated",
		};

		user.assets.push(newAsset);
		await user.save();

		res.status(201).json({ message: "Asset added successfully.", asset: newAsset });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};


// ✅ Update User Asset (e.g., Address)
export const updateAssetAddress = async (req: Request, res: Response) => {
	try {
		const { userId, symbol, address } = req.body;

		// Validate input
		if (!userId || !symbol || !address)
			return res.status(400).json({ message: "User ID, asset symbol, and address are required." });

		// Find user
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found." });

		// Find the asset within user's assets
		const asset = user.assets.find((asset) => asset.symbol === symbol);
		if (!asset) return res.status(404).json({ message: "Asset not found in user account." });

		// Update the address (or any other field)
		asset.address = address;

		// Save changes
		await user.save();

		res.status(200).json({ message: "Asset updated successfully.", asset });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};


// ✅ Delete Asset from User
export const deleteAsset = async (req: Request, res: Response) => {
	try {
		const { userId, symbol } = req.body;

		if (!userId || !symbol)
			return res.status(400).json({ message: "User ID and asset symbol are required." });

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found." });

		// Filter out the asset
		user.assets = user.assets.filter((asset) => asset.symbol !== symbol);
		await user.save();

		res.status(200).json({ message: "Asset removed successfully." });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

// ✅ Complete KYC (Upload Docs & Update Profile)
export const completeKYC = async (req: Request, res: Response) => {
	try {
		const { userId, firstName, lastName, dateOfBirth, phone, country, documentType, documentNumber } =
			req.body;
		const files = req.files as {
			documentFront?: Express.Multer.File[];
			documentBack?: Express.Multer.File[];
		};

		// Validate required fields
		if (
			!userId ||
			!firstName ||
			!lastName ||
			!dateOfBirth ||
			!phone ||
			!country ||
			!documentType ||
			!documentNumber
		) {
			return res.status(400).json({ message: "All fields are required for KYC." });
		}

		// Find user
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found." });

		// Upload images if provided
		let frontImageUrl = user.documentFront;
		let backImageUrl = user.documentBack;

		if (files?.documentFront) frontImageUrl = await uploadKycImage(files.documentFront[0]);
		if (files?.documentBack) backImageUrl = await uploadKycImage(files.documentBack[0]);

		// Update user profile
		user.set({
			firstName,
			lastName,
			dateOfBirth,
			phone,
			country,
			documentType,
			documentNumber,
			documentFront: frontImageUrl,
      documentBack: backImageUrl,
      kycStatus: "pending",
		});

		await user.save();

		res.status(200).json({ message: "KYC completed successfully.", user });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};


//Delete Kyc
export const deleteKyc = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;

		// Find user
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		// Reset KYC fields
		user.kycStatus = "notSubmitted";
		user.dateOfBirth = "";
		user.phone = "";
		user.country = "";
		user.documentType = "";
		user.documentNumber = "";
		user.documentFront = "";
		user.documentBack = "";

		await user.save();

		res.json({ message: "KYC data deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
