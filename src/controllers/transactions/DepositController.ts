import { Request, Response } from "express";
import User from "../../models/userModel";
import Deposit from "../../models/transactions/Deposit";
import { adminTransactionAlert, transactionStatusMail } from "../../services/emailService";

//Create a deposit
export const createDeposit = async (req: Request, res: Response) => {
	try {
		const { userId, amount, currency, address, network } = req.body;

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		const deposit = new Deposit({ userId, amount, currency, address, network });
		await deposit.save();

		await adminTransactionAlert(user.email, amount, currency);

		res.status(201).json({ message: "Deposit request created", deposit });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};

//Get all deposit
export const getDeposits = async (req: Request, res: Response) => {
	try {
		const deposits = await Deposit.find().populate("userId", "email");
		res.status(200).json(deposits);
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};

//Get single deposit
export const getDepositById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const deposit = await Deposit.findById(id).populate("userId", "email");
		if (!deposit) return res.status(404).json({ message: "Deposit not found" });
		res.status(200).json(deposit);
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
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
				arrayFilters: [{ "elem.symbol": deposit.currency }],
				new: true,
			},
		);

		if (updatedUser)
			transactionStatusMail(updatedUser.email, "Deposit", deposit.amount, deposit.currency, "Approved");

		res.status(200).json({ message: "Deposit approved", deposit });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
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

		if (user) transactionStatusMail(user.email, "Deposit", deposit.amount, deposit.currency, "Rejected");

		res.status(200).json({ message: "Deposit rejected", deposit });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};
