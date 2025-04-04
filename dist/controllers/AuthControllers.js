"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.addUser = exports.register = exports.requestVerificationCode = exports.getUser = exports.getAllUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
const codeService_1 = require("../services/codeService");
const token_1 = require("../services/token");
const emailService_1 = require("../services/emailService");
const codeSchema_1 = __importDefault(require("../models/codeSchema"));
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel_1.default.find({ role: { $ne: "admin" } }); // Exclude admins
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "Users not found" });
        }
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.getAllUsers = getAllUsers;
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
            isEmailVerified: true,
        });
        if (referral) {
            user.referral = {
                code: referral,
                status: "pending",
            };
        }
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
// Add user for Admin
const addUser = async (req, res) => {
    const { email, password, referral } = req.body;
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new userModel_1.default({
            email,
            password: hashedPassword,
            isEmailVerified: true,
        });
        if (referral) {
            user.referral = {
                code: referral,
                status: "pending",
            };
        }
        await user.save();
        res.status(201).json({
            message: "User created successfully",
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
exports.addUser = addUser;
// Login Controller
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel_1.default.findOne({ email });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const loginToken = (0, token_1.generateLoginToken)(user._id.toString());
        const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress;
        await (0, emailService_1.loginAlertMail)(user.email, ip);
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
