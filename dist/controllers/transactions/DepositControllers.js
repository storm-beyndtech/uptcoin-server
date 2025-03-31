"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelDeposit = exports.rejectDeposit = exports.approveDeposit = exports.getDepositById = exports.getDeposits = exports.createDeposit = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const Deposit_1 = __importDefault(require("../../models/transactions/Deposit"));
const emailService_1 = require("../../services/emailService");
//Create a deposit
const createDeposit = async (req, res) => {
    try {
        const { userId, amount, symbol, address, network } = req.body;
        // Validate required fields
        if (!userId || !amount || !symbol || !address || !network) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero." });
        }
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const deposit = new Deposit_1.default({ userId, amount, symbol, address, network });
        await deposit.save();
        await (0, emailService_1.adminTransactionAlert)(user.email, amount, symbol);
        res.status(201).json({ message: "Deposit request created", deposit });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.createDeposit = createDeposit;
// Fetch Deposits with Advanced Filters
const getDeposits = async (req, res) => {
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
        const deposits = await Deposit_1.default.find(filter);
        res.status(200).json(deposits);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getDeposits = getDeposits;
//Get single deposit
const getDepositById = async (req, res) => {
    try {
        const { id } = req.params;
        const deposit = await Deposit_1.default.findById(id).populate("userId", "email");
        if (!deposit)
            return res.status(404).json({ message: "Deposit not found" });
        res.status(200).json(deposit);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getDepositById = getDepositById;
//Approve Deposit
const approveDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const deposit = await Deposit_1.default.findById(id);
        if (!deposit)
            return res.status(404).json({ message: "Deposit not found" });
        if (deposit.status !== "pending")
            return res.status(400).json({ message: "Deposit already processed" });
        deposit.status = "approved";
        await deposit.save();
        const updatedUser = await userModel_1.default.findByIdAndUpdate(deposit.userId, {
            $inc: { "assets.$[elem].funding": deposit.amount },
        }, {
            arrayFilters: [{ "elem.symbol": deposit.symbol }],
            new: true,
        });
        if (updatedUser)
            (0, emailService_1.transactionStatusMail)(updatedUser.email, "Deposit", deposit.amount, deposit.symbol, "Approved");
        res.status(200).json({ message: "Deposit approved", deposit });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.approveDeposit = approveDeposit;
//Reject Deposit
const rejectDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const deposit = await Deposit_1.default.findById(id);
        if (!deposit)
            return res.status(404).json({ message: "Deposit not found" });
        if (deposit.status !== "pending")
            return res.status(400).json({ message: "Deposit already processed" });
        deposit.status = "rejected";
        await deposit.save();
        const user = await userModel_1.default.findById(deposit.userId);
        if (user)
            (0, emailService_1.transactionStatusMail)(user.email, "Deposit", deposit.amount, deposit.symbol, "Rejected");
        res.status(200).json({ message: "Deposit rejected", deposit });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.rejectDeposit = rejectDeposit;
// Cancel Deposit
const cancelDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const deposit = await Deposit_1.default.findById(id);
        if (!deposit) {
            return res.status(404).json({ message: "Deposit not found" });
        }
        if (deposit.status !== "pending") {
            return res.status(400).json({ message: "Deposit already processed" });
        }
        await Deposit_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Deposit canceled successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.cancelDeposit = cancelDeposit;
