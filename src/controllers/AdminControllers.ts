import { Request, Response } from "express";
import { adminMail } from "../services/emailService";

export const sendAdminMail = async (req: Request, res: Response) => {
	try {
		const { recipients, subject, message } = req.body;

		// Validate required fields
		if (!recipients || !subject || !message) {
			return res.status(400).json({ message: "Recipients, subject, and message are required." });
		}

		// Send email(s)
		await adminMail(recipients, subject, message);

		res.status(200).json({ message: "Email sent successfully!" });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};
