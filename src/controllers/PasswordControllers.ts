import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import { validateCode } from "../services/codeService";
import { passwordResetMail } from "../services/emailService";
import VerificationCode from "../models/codeSchema";

// Step 1: Request Password Reset Code
export const requestResetCode = async (req: Request, res: Response) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		const { code } = await VerificationCode.create({ email });
		if (!code) return res.status(500).json({ message: "error generating code" });

		await passwordResetMail(email, code);

		res.status(200).json({ message: "Password reset code sent successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error sending reset code" });
	}
};

// Step 2: Reset Password
export const resetPassword = async (req: Request, res: Response) => {
	const { email, newPassword, code } = req.body;

	try {
		const isValid = await validateCode(email, code);
		if (!isValid) {
			return res.status(400).json({ message: "Invalid or expired reset code" });
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await User.updateOne({ email }, { password: hashedPassword });

		res.status(200).json({ message: "Password reset successfully" });
	} catch (error) {
		res.status(500).json({ message: "Password reset failed" });
	}
};

//Check if user already created withdrawal password
export const checkWithdrawalPassword = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return res.status(400).json({ message: "User ID is required." });
		}

		const user = await User.findById(userId).select("withdrawalPassword");

		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		res.status(200).json({ hasWithdrawalPassword: !!user.withdrawalPassword });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};

//Set Withdrawal Password
export const setWithdrawalPassword = async (req: Request, res: Response) => {
	try {
		const { userId, withdrawalPassword, currentPassword } = req.body;

		if (!userId || !withdrawalPassword) {
			return res.status(400).json({ message: "User ID and new password are required." });
		}

		// Find user
		const user = await User.findById(userId).select("withdrawalPassword");
		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		// If user already has a withdrawal password, check if current password is provided
		if (user.withdrawalPassword) {
			if (!currentPassword) {
				return res
					.status(400)
					.json({ message: "Current password is required to update withdrawal password." });
			}

			// Compare currentPassword with the stored hashed password
			const isMatch = await bcrypt.compare(currentPassword, user.withdrawalPassword);
			if (!isMatch) {
				return res.status(400).json({ message: "Current withdrawal password is incorrect." });
			}
		}

		// Hash the new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(withdrawalPassword, salt);

		// Update withdrawal password
		await User.findByIdAndUpdate(userId, { withdrawalPassword: hashedPassword });

		res.status(200).json({
			message: user.withdrawalPassword
				? "Withdrawal password updated successfully."
				: "Withdrawal password set successfully.",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};

//update account password
export const updateAccountPassword = async (req: Request, res: Response) => {
	try {
		const { userId, currentPassword, newPassword } = req.body;

		// Check if all fields are provided
		if (!userId || !currentPassword || !newPassword) {
			return res.status(400).json({ message: "All fields are required." });
		}

		// Find the user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		// Compare the current password with the stored hash
		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Current password is incorrect." });
		}

		// Hash the new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// Update password in database
		user.password = hashedPassword;
		await user.save();

		res.status(200).json({ message: "Password updated successfully." });
	} catch (error) {
		console.error("Error updating password:", error);
		res.status(500).json({ message: "Server error. Please try again later." });
	}
};
