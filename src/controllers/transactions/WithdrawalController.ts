import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../models/userModel";
import Withdrawal from "../../models/transactions/Withdrawal";
import { adminTransactionAlert, transactionStatusMail } from "../../services/emailService";

// Create a withdrawal request
export const createWithdrawal = async (req: Request, res: Response) => {
	try {
		const { userId, amount, symbol, address, network, withdrawalPassword } = req.body;

		// Validate required fields
		if (!userId || !amount || !symbol || !address || !network) {
			return res.status(400).json({ message: "All fields are required" });
		}

		if (amount <= 0) {
			return res.status(400).json({ message: "Amount must be greater than zero." });
		}

		const user = await User.findById(userId);
		if (!user || !user.withdrawalPassword) {
			return res.status(400).json({ message: "User or withdrawal password not found." });
		}

		// Compare passwords
		const isMatch = await bcrypt.compare(withdrawalPassword, user.withdrawalPassword);
		if (!isMatch) {
			return res.status(401).json({ message: "Incorrect withdrawal password." });
		}

		const withdrawal = new Withdrawal({ userId, amount, symbol, address, network });
		await withdrawal.save();

		await adminTransactionAlert(user.email, amount, symbol);

		res.status(201).json({ message: "Withdrawal request created", withdrawal });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
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
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};

// Get single withdrawal
export const getWithdrawalById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const withdrawal = await Withdrawal.findById(id).populate("userId", "email");
		if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
		res.status(200).json(withdrawal);
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
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

		withdrawal.status = "approved";
		await withdrawal.save();

		const user = await User.findById(withdrawal.userId);

		if (user)
			await transactionStatusMail(user.email, "Withdrawal", withdrawal.amount, withdrawal.symbol, "Approved");

		res.status(200).json({ message: "Withdrawal approved", withdrawal });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
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
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
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
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};
