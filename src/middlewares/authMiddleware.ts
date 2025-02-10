import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

const TokenPayload = z.object({
	_id: z.string(),
});

interface CustomRequest extends Request {
	user?: z.infer<typeof TokenPayload>;
}

export const authMiddleware = () => {
	return (req: CustomRequest, res: Response, next: NextFunction) => {
		if (req.path === "/login") {
			const token = req.headers.authorization?.split(" ")[1];
			if (!token) return res.status(401).json({ message: "No token provided" });

			try {
				const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
				const validatedPayload = TokenPayload.parse(decoded);

				req.user = validatedPayload;

				next();
			} catch (error) {
				res.status(401).json({ message: "Invalid or expired token" });
			}
		} else next();
	};
};