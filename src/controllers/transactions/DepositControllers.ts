import { Request, Response } from "express";
import User from "../../models/userModel";
import Deposit from "../../models/transactions/Deposit";
import { adminTransactionAlert, transactionStatusMail } from "../../services/emailService";

//Create a deposit
export const createDeposit = async (req: Request, res: Response) => {
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
		if (!user) return res.status(404).json({ message: "User not found" });

		const deposit = new Deposit({ userId, amount, symbol, address, network });
		await deposit.save();

		await adminTransactionAlert(user.email, amount, symbol);

		res.status(201).json({ message: "Deposit request created", deposit });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

// Fetch Deposits with Advanced Filters
export const getDeposits = async (req: Request, res: Response) => {
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

		const deposits = await Deposit.find(filter);

		res.status(200).json(deposits);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

//Get single deposit
export const getDepositById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const deposit = await Deposit.findById(id).populate("userId", "email");
		if (!deposit) return res.status(404).json({ message: "Deposit not found" });
		res.status(200).json(deposit);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

//Approve Deposit
export const approveDeposit = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const deposit = await Deposit.findById(id);
		if (!deposit) return res.status(404).json({ message: "Deposit not found" });
		if (deposit.status !== "pending") return res.status(400).json({ message: "Deposit already processed" });

		deposit.status = "approved";
		await deposit.save();

		const updatedUser = await User.findByIdAndUpdate(
			deposit.userId,
			{
				$inc: { "assets.$[elem].funding": deposit.amount },
			},
			{
				arrayFilters: [{ "elem.symbol": deposit.symbol }],
				new: true,
			},
		);

		if (updatedUser)
			transactionStatusMail(updatedUser.email, "Deposit", deposit.amount, deposit.symbol, "Approved");

		res.status(200).json({ message: "Deposit approved", deposit });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

//Reject Deposit
export const rejectDeposit = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const deposit = await Deposit.findById(id);
		if (!deposit) return res.status(404).json({ message: "Deposit not found" });
		if (deposit.status !== "pending") return res.status(400).json({ message: "Deposit already processed" });

		deposit.status = "rejected";
		await deposit.save();

		const user = await User.findById(deposit.userId);

		if (user) transactionStatusMail(user.email, "Deposit", deposit.amount, deposit.symbol, "Rejected");

		res.status(200).json({ message: "Deposit rejected", deposit });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

// Cancel Deposit
export const cancelDeposit = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const deposit = await Deposit.findById(id);

		if (!deposit) {
			return res.status(404).json({ message: "Deposit not found" });
		}

		if (deposit.status !== "pending") {
			return res.status(400).json({ message: "Deposit already processed" });
		}

		await Deposit.findByIdAndDelete(id);

		res.status(200).json({ message: "Deposit canceled successfully" });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};
