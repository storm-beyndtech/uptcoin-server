import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../models/userModel";
import Withdrawal from "../../models/transactions/Withdrawal";
import { adminTransactionAlert, transactionStatusMail } from "../../services/emailService";
import { Coin } from "../../models/coinModel";

// Create a withdrawal request
export const createWithdrawal = async (req: Request, res: Response) => {
	try {
		const { userId, amount, symbol, address, network } = req.body;

		// Validate required fields
		if (!userId || !amount || !symbol || !address || !network) {
			return res.status(400).json({ message: "All fields are required" });
		}

		if (amount <= 0) {
			return res.status(400).json({ message: "Amount must be greater than zero." });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(400).json({ message: "User not found." });
		}

		const coin = await Coin.findOne({ symbol });
		if (!coin) {
			return res.status(400).json({ message: "Coin not found." });
		}

		const fee = coin.withdrawalFee || 0;
		const totalAmount = Number(amount) - Number(fee);

		if (totalAmount <= 0) {
			return res.status(400).json({ message: "Amount must be greater than the withdrawal fee." });
		}

		const withdrawal = new Withdrawal({
			userId,
			amount: totalAmount,
			symbol,
			address,
			network,
			fee,
		});

		await withdrawal.save();

		await adminTransactionAlert(user.email, amount, symbol);

		res.status(201).json({ message: "Withdrawal request created", withdrawal });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

// Fetch Withdrawals with Advanced Filters
export const getWithdrawals = async (req: Request, res: Response) => {
	try {
		const { status, userId, symbol } = req.query;

		const filter: any = {};

		if (status && ["pending", "approved", "rejected"].includes(status as string)) {
			filter.status = status;
		}

		if (userId) {
			filter.userId = userId;
		}

		if (symbol) {
			filter.symbol = symbol;
		}

		const withdrawals = await Withdrawal.find(filter);

		res.status(200).json(withdrawals);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

// Get single withdrawal
export const getWithdrawalById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const withdrawal = await Withdrawal.findById(id).populate("userId", "email");
		if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
		res.status(200).json(withdrawal);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

// Approve Withdrawal
export const approveWithdrawal = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const withdrawal = await Withdrawal.findById(id);
		if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });

		if (withdrawal.status !== "pending")
			return res.status(400).json({ message: "Withdrawal already processed" });

		const user = await User.findById(withdrawal.userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		// Find the asset by symbol
		const asset = user.assets.find((a) => a.symbol === withdrawal.symbol);
		if (!asset) return res.status(400).json({ message: `User has no ${withdrawal.symbol} wallet` });

		// Check if there's enough balance in funding
		if (asset.funding < withdrawal.amount)
			return res.status(400).json({ message: "Insufficient balance in funding wallet" });

		// Debit the funding balance
		asset.funding -= withdrawal.amount;

		// Approve withdrawal
		withdrawal.status = "approved";

		// Save both user and withdrawal
		await Promise.all([user.save(), withdrawal.save()]);

		// Send notification
		await transactionStatusMail(user.email, "Withdrawal", withdrawal.amount, withdrawal.symbol, "Approved");

		res.status(200).json({ message: "Withdrawal approved", withdrawal });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

// Reject Withdrawal
export const rejectWithdrawal = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const withdrawal = await Withdrawal.findById(id);
		if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
		if (withdrawal.status !== "pending")
			return res.status(400).json({ message: "Withdrawal already processed" });

		withdrawal.status = "rejected";
		await withdrawal.save();

		const user = await User.findById(withdrawal.userId);

		if (user)
			await transactionStatusMail(user.email, "Withdrawal", withdrawal.amount, withdrawal.symbol, "Rejected");

		res.status(200).json({ message: "Withdrawal rejected", withdrawal });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

// Cancel Withdrawal
export const cancelWithdrawal = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const deposit = await Withdrawal.findById(id);

		if (!deposit) {
			return res.status(404).json({ message: "Withdrawal not found" });
		}

		if (deposit.status !== "pending") {
			return res.status(400).json({ message: "Withdrawal already processed" });
		}

		await Withdrawal.findByIdAndDelete(id);

		res.status(200).json({ message: "Withdrawal canceled successfully" });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

//Process withdrawal for admin
export const adminWithdraw = async (req: Request, res: Response) => {
	try {
		const { userId, amount, symbol, address, network } = req.body;

		// Validate required fields
		if (!userId || !amount || !symbol || !address || !network) {
			return res.status(400).json({ message: "All fields are required." });
		}

		if (amount <= 0) {
			return res.status(400).json({ message: "Amount must be greater than zero." });
		}

		// Find user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		// Find the asset in user's balance
		const assetIndex = user.assets.findIndex((asset) => asset.symbol === symbol);
		if (assetIndex === -1) {
			return res.status(400).json({ message: `User does not have ${symbol} in their assets.` });
		}

		// Get the user's asset balance
		const userAsset = user.assets[assetIndex];

		// Ensure sufficient balance
		if (userAsset.funding < amount) {
			return res.status(400).json({ message: "Insufficient balance for withdrawal." });
		}

		// Fetch coin details (for withdrawal fee)
		const coin = await Coin.findOne({ symbol });
		if (!coin) {
			return res.status(400).json({ message: "Coin not found." });
		}

		const fee = coin.withdrawalFee || 0;
		const totalAmount = Number(amount) - Number(fee);

		if (totalAmount <= 0) {
			return res.status(400).json({ message: "Amount must be greater than the withdrawal fee." });
		}

		// Deduct user balance
		user.assets[assetIndex].funding -= amount;
		await user.save();

		// Create withdrawal record
		const withdrawal = new Withdrawal({
			userId,
			amount: totalAmount,
			symbol,
			address,
			network,
			fee,
			status: "approved",
		});

		await withdrawal.save();

		// Send notifications
		await transactionStatusMail(user.email, "Withdrawal", withdrawal.amount, withdrawal.symbol, "Approved");

		res.status(201).json({ message: "Withdrawal processed successfully.", withdrawal });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};
