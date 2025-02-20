import { z } from "zod";

// User Validation Schema
export const userValidationSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	dateOfBirth: z.string().optional(),
	phone: z.string().optional(),
	country: z.string().optional(),
	documentType: z.string().optional(),
	documentFront: z.string().optional(),
	documentBack: z.string().optional(),

	email: z.string().email(),
	password: z.string().min(6, "Password must be at least 6 characters"),
	referral: z.string().optional(),
	isEmailVerified: z.boolean().default(false),

	tradingStatus: z.string().optional(),
	tradingLevel: z.string().optional(),
	tradingLimit: z.string().optional(),

	assets: z
		.array(
			z.object({
				symbol: z.string(),
				funding: z.number(),
				spot: z.number(),
				name: z.string(),
				address: z.string(),
				network: z.string(),
			}),
		)
		.optional(),

	disabled: z.boolean().default(false),
});

// Infer TypeScript Type for Mongoose
export type UserType = z.infer<typeof userValidationSchema>;
