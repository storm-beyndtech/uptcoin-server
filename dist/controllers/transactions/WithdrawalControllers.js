"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelWithdrawal = exports.rejectWithdrawal = exports.approveWithdrawal = exports.getWithdrawalById = exports.getWithdrawals = exports.createWithdrawal = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const Withdrawal_1 = __importDefault(require("../../models/transactions/Withdrawal"));
const emailService_1 = require("../../services/emailService");
const coinModel_1 = require("../../models/coinModel");
// Create a withdrawal request
const createWithdrawal = async (req, res) => {
    try {
        const { userId, amount, symbol, address, network, withdrawalPassword } = req.body;
        console.log(userId, amount, symbol, address, network, withdrawalPassword);
        // Validate required fields
        if (!userId || !amount || !symbol || !address || !network) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero." });
        }
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }
        if (!user.withdrawalPassword) {
            return res.status(400).json({ message: "Create/Enter withdrawal password." });
        }
        // Compare withdrawal passwords
        const isMatch = await bcryptjs_1.default.compare(withdrawalPassword, user.withdrawalPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect withdrawal password." });
        }
        const coin = await coinModel_1.Coin.findOne({ symbol });
        if (!coin) {
            return res.status(400).json({ message: "Coin not found." });
        }
        const fee = coin.withdrawalFee || 0;
        const totalAmount = Number(amount) - Number(fee);
        if (totalAmount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than the withdrawal fee." });
        }
        const withdrawal = new Withdrawal_1.default({
            userId,
            amount: totalAmount,
            symbol,
            address,
            network,
            fee,
        });
        await withdrawal.save();
        await (0, emailService_1.adminTransactionAlert)(user.email, amount, symbol);
        res.status(201).json({ message: "Withdrawal request created", withdrawal });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createWithdrawal = createWithdrawal;
// Fetch Withdrawals with Advanced Filters
const getWithdrawals = async (req, res) => {
    try {
        const { status, userId, symbol } = req.query;
        const filter = {};
        if (status && ["pending", "approved", "rejected"].includes(status)) {
            filter.status = status;
        }
        if (userId) {
            filter.userId = userId;
        }
        if (symbol) {
            filter.symbol = symbol;
        }
        const withdrawals = await Withdrawal_1.default.find(filter);
        res.status(200).json(withdrawals);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
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
            await (0, emailService_1.transactionStatusMail)(user.email, "Withdrawal", withdrawal.amount, withdrawal.symbol, "Approved");
        res.status(200).json({ message: "Withdrawal approved", withdrawal });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
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
            await (0, emailService_1.transactionStatusMail)(user.email, "Withdrawal", withdrawal.amount, withdrawal.symbol, "Rejected");
        res.status(200).json({ message: "Withdrawal rejected", withdrawal });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.rejectWithdrawal = rejectWithdrawal;
// Cancel Withdrawal
const cancelWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const deposit = await Withdrawal_1.default.findById(id);
        if (!deposit) {
            return res.status(404).json({ message: "Withdrawal not found" });
        }
        if (deposit.status !== "pending") {
            return res.status(400).json({ message: "Withdrawal already processed" });
        }
        await Withdrawal_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Withdrawal canceled successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.cancelWithdrawal = cancelWithdrawal;
