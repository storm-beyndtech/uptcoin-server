"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountPassword = exports.setWithdrawalPassword = exports.checkWithdrawalPassword = exports.resetPassword = exports.requestResetCode = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
const codeService_1 = require("../services/codeService");
const emailService_1 = require("../services/emailService");
const codeSchema_1 = __importDefault(require("../models/codeSchema"));
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
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
    }
};
exports.resetPassword = resetPassword;
//Check if user already created withdrawal password
const checkWithdrawalPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }
        const user = await userModel_1.default.findById(userId).select("withdrawalPassword");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({ hasWithdrawalPassword: !!user.withdrawalPassword });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.checkWithdrawalPassword = checkWithdrawalPassword;
//Set Withdrawal Password
const setWithdrawalPassword = async (req, res) => {
    try {
        const { userId, withdrawalPassword, currentPassword } = req.body;
        if (!userId || !withdrawalPassword) {
            return res.status(400).json({ message: "User ID and new password are required." });
        }
        // Find user
        const user = await userModel_1.default.findById(userId).select("withdrawalPassword");
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
            const isMatch = await bcryptjs_1.default.compare(currentPassword, user.withdrawalPassword);
            if (!isMatch) {
                return res.status(400).json({ message: "Current withdrawal password is incorrect." });
            }
        }
        // Hash the new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(withdrawalPassword, salt);
        // Update withdrawal password
        await userModel_1.default.findByIdAndUpdate(userId, { withdrawalPassword: hashedPassword });
        res.status(200).json({
            message: user.withdrawalPassword
                ? "Withdrawal password updated successfully."
                : "Withdrawal password set successfully.",
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.setWithdrawalPassword = setWithdrawalPassword;
//update account password
const updateAccountPassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        // Check if all fields are provided
        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required." });
        }
        // Find the user
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Compare the current password with the stored hash
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }
        // Hash the new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        // Update password in database
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password updated successfully." });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateAccountPassword = updateAccountPassword;
