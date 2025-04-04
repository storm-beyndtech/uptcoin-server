import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import { validateCode } from "../services/codeService";
import { generateLoginToken } from "../services/token";
import { loginAlertMail, verificationCodeMail } from "../services/emailService";
import VerificationCode from "../models/codeSchema";

export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const users = await User.find({ role: { $ne: "admin" } }); // Exclude admins

		if (!users || users.length === 0) {
			return res.status(404).json({ message: "Users not found" });
		}

		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: "Something went wrong" });
	}
};

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
			isEmailVerified: true,
		});

		if (referral) {
			user.referral = {
				code: referral,
				status: "pending",
			};
		}

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

// Add user for Admin
export const addUser = async (req: Request, res: Response) => {
	const { email, password, referral } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = new User({
			email,
			password: hashedPassword,
			isEmailVerified: true,
		});

		if (referral) {
			user.referral = {
				code: referral,
				status: "pending",
			};
		}

		await user.save();

		res.status(201).json({
			message: "User created successfully",
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

		const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress;
		await loginAlertMail(user.email, ip);

		res.status(200).json({
			message: "Login successful",
			token: loginToken,
			user,
		});
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ message: `Login failed: ${error.message}` });
		} else {
			console.log(error);
		}
	}
};
