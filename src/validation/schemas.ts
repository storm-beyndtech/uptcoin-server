import { z } from "zod";

// User Validation Schema
export const userValidationSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	dateOfBirth: z.string().optional(),
	phone: z.string().optional(),
	country: z.string().optional(),
	documentType: z.string().optional(),
	documentNumber: z.string().optional(),
	documentFront: z.string().optional(),
	documentBack: z.string().optional(),

	email: z.string().email(),
	password: z.string().min(6, "Password must be at least 6 characters"),
	withdrawalPassword: z.string().min(6, "Password must be at least 6 characters"),
	referral: z.object({
		code: z.string(),
		status: z.enum(["claimed", "none", "pending"]).default("none"),
	}),
	isEmailVerified: z.boolean().default(false),
	kycStatus: z.string(),

	tradingStatus: z.string().optional(),
	tradingLevel: z.string().optional(),
	tradingLimit: z.string().optional(),
	isTradeSuspended: z.boolean().default(false),
	minDeposit: z.number(),
	maxDeposit: z.number(),
	minWithdrawal: z.number(),
	maxWithdrawal: z.number(),

	assets: z.array(
		z.object({
			symbol: z.string(),
			funding: z.number(),
			spot: z.number(),
			name: z.string(),
			address: z.string(),
			network: z.string(),
			status: z.string(),
		}),
	),

	accountStatus: z.string(),
	role: z.string(),
});

// Infer TypeScript Type for Mongoose
export type UserType = z.infer<typeof userValidationSchema>;
