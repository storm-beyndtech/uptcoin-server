"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectDeposit = exports.approveDeposit = exports.getDepositById = exports.getDeposits = exports.createDeposit = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const Deposit_1 = __importDefault(require("../../models/transactions/Deposit"));
const emailService_1 = require("../../services/emailService");
//Create a deposit
const createDeposit = async (req, res) => {
    try {
        const { userId, amount, currency, address, network } = req.body;
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const deposit = new Deposit_1.default({ userId, amount, currency, address, network });
        await deposit.save();
        await (0, emailService_1.adminTransactionAlert)(user.email, amount, currency);
        res.status(201).json({ message: "Deposit request created", deposit });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.createDeposit = createDeposit;
//Get all deposit
const getDeposits = async (req, res) => {
    try {
        const deposits = await Deposit_1.default.find().populate("userId", "email");
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
            arrayFilters: [{ "elem.symbol": deposit.currency }],
            new: true,
        });
        if (updatedUser)
            (0, emailService_1.transactionStatusMail)(updatedUser.email, "Deposit", deposit.amount, deposit.currency, "Approved");
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
            (0, emailService_1.transactionStatusMail)(user.email, "Deposit", deposit.amount, deposit.currency, "Rejected");
        res.status(200).json({ message: "Deposit rejected", deposit });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.rejectDeposit = rejectDeposit;
