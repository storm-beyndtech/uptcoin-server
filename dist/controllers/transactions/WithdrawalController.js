"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectWithdrawal = exports.approveWithdrawal = exports.getWithdrawalById = exports.getWithdrawals = exports.createWithdrawal = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const Withdrawal_1 = __importDefault(require("../../models/transactions/Withdrawal"));
const emailService_1 = require("../../services/emailService");
// Create a withdrawal request
const createWithdrawal = async (req, res) => {
    try {
        const { userId, amount, currency, address, network } = req.body;
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const withdrawal = new Withdrawal_1.default({ userId, amount, currency, address, network });
        await withdrawal.save();
        await (0, emailService_1.adminTransactionAlert)(user.email, amount, currency);
        res.status(201).json({ message: "Withdrawal request created", withdrawal });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.createWithdrawal = createWithdrawal;
// Get all withdrawals
const getWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal_1.default.find().populate("userId", "email");
        res.status(200).json(withdrawals);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getWithdrawals = getWithdrawals;
// Get single withdrawal
const getWithdrawalById = async (req, res) => {
    try {
        const { id } = req.params;
        const withdrawal = await Withdrawal_1.default.findById(id).populate("userId", "email");
        if (!withdrawal)
            return res.status(404).json({ message: "Withdrawal not found" });
        res.status(200).json(withdrawal);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getWithdrawalById = getWithdrawalById;
// Approve Withdrawal
const approveWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const withdrawal = await Withdrawal_1.default.findById(id);
        if (!withdrawal)
            return res.status(404).json({ message: "Withdrawal not found" });
        if (withdrawal.status !== "pending")
            return res.status(400).json({ message: "Withdrawal already processed" });
        withdrawal.status = "approved";
        await withdrawal.save();
        const user = await userModel_1.default.findById(withdrawal.userId);
        if (user)
            await (0, emailService_1.transactionStatusMail)(user.email, "Withdrawal", withdrawal.amount, withdrawal.currency, "Approved");
        res.status(200).json({ message: "Withdrawal approved", withdrawal });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.approveWithdrawal = approveWithdrawal;
// Reject Withdrawal
const rejectWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const withdrawal = await Withdrawal_1.default.findById(id);
        if (!withdrawal)
            return res.status(404).json({ message: "Withdrawal not found" });
        if (withdrawal.status !== "pending")
            return res.status(400).json({ message: "Withdrawal already processed" });
        withdrawal.status = "rejected";
        await withdrawal.save();
        const user = await userModel_1.default.findById(withdrawal.userId);
        if (user)
            await (0, emailService_1.transactionStatusMail)(user.email, "Withdrawal", withdrawal.amount, withdrawal.currency, "Rejected");
        res.status(200).json({ message: "Withdrawal rejected", withdrawal });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.rejectWithdrawal = rejectWithdrawal;
