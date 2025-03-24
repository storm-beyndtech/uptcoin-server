"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestResetCode = exports.login = exports.register = exports.requestVerificationCode = exports.getUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
const codeService_1 = require("../services/codeService");
const token_1 = require("../services/token");
const emailService_1 = require("../services/emailService");
const codeSchema_1 = __importDefault(require("../models/codeSchema"));
const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userModel_1.default.findById(id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.getUser = getUser;
// Request Email Verification Code
const requestVerificationCode = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel_1.default.findOne({ email });
        if (user)
            return res.status(400).json({ message: "User already exists" });
        const { code } = await codeSchema_1.default.create({ email });
        if (!code)
            return res.status(500).json({ message: "error generating code" });
        await (0, emailService_1.verificationCodeMail)(email, code);
        res.status(200).json({ message: "Verification code sent successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error sending verification code" });
    }
};
exports.requestVerificationCode = requestVerificationCode;
// Step 2: Complete Registration
const register = async (req, res) => {
    const { email, password, referral, code } = req.body;
    try {
        const isValid = await (0, codeService_1.validateCode)(email, code);
        if (!isValid)
            return res.status(400).json({ message: "Invalid or expired verification code" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new userModel_1.default({
            email,
            password: hashedPassword,
            referral,
            isEmailVerified: true,
        });
        await user.save();
        const loginToken = (0, token_1.generateLoginToken)(user._id.toString());
        res.status(201).json({
            message: "User registered successfully",
            token: loginToken,
            user,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: `Registration failed: ${error.message}` });
        }
        else {
            console.log(error);
        }
    }
};
exports.register = register;
// Login Controller
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel_1.default.findOne({ email });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const loginToken = (0, token_1.generateLoginToken)(user._id.toString());
        res.status(200).json({
            message: "Login successful",
            token: loginToken,
            user,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: `Login failed: ${error.message}` });
        }
        else {
            console.log(error);
        }
    }
};
exports.login = login;
// Step 1: Request Password Reset Code
const requestResetCode = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const { code } = await codeSchema_1.default.create({ email });
        if (!code)
            return res.status(500).json({ message: "error generating code" });
        await (0, emailService_1.passwordResetMail)(email, code);
        res.status(200).json({ message: "Password reset code sent successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error sending reset code" });
    }
};
exports.requestResetCode = requestResetCode;
// Step 2: Reset Password
const resetPassword = async (req, res) => {
    const { email, newPassword, code } = req.body;
    try {
        const isValid = await (0, codeService_1.validateCode)(email, code);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await userModel_1.default.updateOne({ email }, { password: hashedPassword });
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Password reset failed" });
    }
};
exports.resetPassword = resetPassword;
