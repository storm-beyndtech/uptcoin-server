import { Request, Response } from "express";
import User from "../../models/userModel";
import Withdrawal from "../../models/transactions/Withdrawal";
import { adminTransactionAlert, transactionStatusMail } from "../../services/emailService";

// Create a withdrawal request
export const createWithdrawal = async (req: Request, res: Response) => {
	try {
		const { userId, amount, currency, address, network } = req.body;

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		const withdrawal = new Withdrawal({ userId, amount, currency, address, network });
		await withdrawal.save();

		await adminTransactionAlert(user.email, amount, currency);

		res.status(201).json({ message: "Withdrawal request created", withdrawal });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};

// Get all withdrawals
export const getWithdrawals = async (req: Request, res: Response) => {
	try {
		const withdrawals = await Withdrawal.find().populate("userId", "email");
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
			await transactionStatusMail(
				user.email,
				"Withdrawal",
				withdrawal.amount,
				withdrawal.currency,
				"Approved",
			);

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
			await transactionStatusMail(
				user.email,
				"Withdrawal",
				withdrawal.amount,
				withdrawal.currency,
				"Rejected",
			);

		res.status(200).json({ message: "Withdrawal rejected", withdrawal });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};
