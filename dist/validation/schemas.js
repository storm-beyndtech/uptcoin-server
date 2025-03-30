"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidationSchema = void 0;
const zod_1 = require("zod");
// User Validation Schema
exports.userValidationSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    documentType: zod_1.z.string().optional(),
    documentFront: zod_1.z.string().optional(),
    documentBack: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    withdrawalPassword: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    referral: zod_1.z.string().optional(),
    isEmailVerified: zod_1.z.boolean().default(false),
    tradingStatus: zod_1.z.string().optional(),
    tradingLevel: zod_1.z.string().optional(),
    tradingLimit: zod_1.z.string().optional(),
    assets: zod_1.z
        .array(zod_1.z.object({
        symbol: zod_1.z.string(),
        funding: zod_1.z.number(),
        spot: zod_1.z.number(),
        staking: zod_1.z.number(),
        name: zod_1.z.string(),
        address: zod_1.z.string(),
        network: zod_1.z.string(),
    })),
    disabled: zod_1.z.boolean().default(false),
});
