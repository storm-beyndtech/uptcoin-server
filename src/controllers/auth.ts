import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import { validateCode } from "../services/codeService";
import { generateLoginToken } from "../services/token";
import { passwordResetMail, verificationCodeMail } from "../services/emailService";
import VerificationCode from "../models/codeSchema";

export const getUser = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const user = await User.findById(id);
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json({ user });
	} catch (error) {
		res.status(500).json({ message: "Something went wrong" });
	}
};

// Request Email Verification Code
export const requestVerificationCode = async (req: Request, res: Response) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });

		if (user) return res.status(400).json({ message: "User already exists" });

		const { code } = await VerificationCode.create({ email });
		if (!code) return res.status(500).json({ message: "error generating code" });

		await verificationCodeMail(email, code);

		res.status(200).json({ message: "Verification code sent successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error sending verification code" });
	}
};

// Step 2: Complete Registration
export const register = async (req: Request, res: Response) => {
	const { email, password, referral, code } = req.body;

	try {
		const isValid = await validateCode(email, code);

		if (!isValid) return res.status(400).json({ message: "Invalid or expired verification code" });

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = new User({
			email,
			password: hashedPassword,
			referral,
			isEmailVerified: true,
		});

		await user.save();
		const loginToken = generateLoginToken(user._id.toString());

		res.status(201).json({
			message: "User registered successfully",
			token: loginToken,
			user,
		});
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: `Registration failed: ${error.message}` });
		} else {
			console.log(error);
		}
	}
};

// Login Controller
export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		const loginToken = generateLoginToken(user._id.toString());

		res.status(200).json({
			message: "Login successful",
			token: loginToken,
			user,
		});
	} catch (error) {
		res.status(500).json({ message: "Login failed" });
	}
};

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
