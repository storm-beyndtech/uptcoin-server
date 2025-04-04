"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserByAdmin = exports.approveKyc = exports.deleteKyc = exports.completeKYC = exports.deleteAsset = exports.updateAssetAddress = exports.addAsset = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const coinModel_1 = require("../models/coinModel");
const uploadHelper_1 = require("../utils/uploadHelper");
// ✅ Add Asset to User
const addAsset = async (req, res) => {
    try {
        const { userId, symbol } = req.body;
        // Validate input
        if (!userId || !symbol)
            return res.status(400).json({ message: "User ID and asset symbol are required." });
        // Find user
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found." });
        // Check if asset already exists
        if (user.assets.some((asset) => asset.symbol === symbol)) {
            return res.status(400).json({ message: "Asset already exists in user account." });
        }
        // Fetch coin details
        const coin = await coinModel_1.Coin.findOne({ symbol });
        if (!coin)
            return res.status(404).json({ message: "Coin not found." });
        // Add asset with default values
        const newAsset = {
            symbol: coin.symbol,
            name: coin.name,
            network: coin.network,
            funding: 0,
            spot: 0,
            address: "",
            status: "activated",
        };
        user.assets.push(newAsset);
        await user.save();
        res.status(201).json({ message: "Asset added successfully.", asset: newAsset });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addAsset = addAsset;
// ✅ Update User Asset (e.g., Address)
const updateAssetAddress = async (req, res) => {
    try {
        const { userId, symbol, address } = req.body;
        // Validate input
        if (!userId || !symbol || !address)
            return res.status(400).json({ message: "User ID, asset symbol, and address are required." });
        // Find user
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found." });
        // Find the asset within user's assets
        const asset = user.assets.find((asset) => asset.symbol === symbol);
        if (!asset)
            return res.status(404).json({ message: "Asset not found in user account." });
        // Update the address (or any other field)
        asset.address = address;
        // Save changes
        await user.save();
        res.status(200).json({ message: "Asset updated successfully.", asset });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateAssetAddress = updateAssetAddress;
// ✅ Delete Asset from User
const deleteAsset = async (req, res) => {
    try {
        const { userId, symbol } = req.body;
        if (!userId || !symbol)
            return res.status(400).json({ message: "User ID and asset symbol are required." });
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found." });
        // Filter out the asset
        user.assets = user.assets.filter((asset) => asset.symbol !== symbol);
        await user.save();
        res.status(200).json({ message: "Asset removed successfully." });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteAsset = deleteAsset;
// ✅ Complete KYC (Upload Docs & Update Profile)
const completeKYC = async (req, res) => {
    try {
        const { userId, firstName, lastName, dateOfBirth, phone, country, documentType, documentNumber } = req.body;
        const files = req.files;
        // Validate required fields
        if (!userId ||
            !firstName ||
            !lastName ||
            !dateOfBirth ||
            !phone ||
            !country ||
            !documentType ||
            !documentNumber) {
            return res.status(400).json({ message: "All fields are required for KYC." });
        }
        // Find user
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found." });
        // Upload images if provided
        let frontImageUrl = user.documentFront;
        let backImageUrl = user.documentBack;
        if (files?.documentFront)
            frontImageUrl = await (0, uploadHelper_1.uploadKycImage)(files.documentFront[0]);
        if (files?.documentBack)
            backImageUrl = await (0, uploadHelper_1.uploadKycImage)(files.documentBack[0]);
        // Update user profile
        user.set({
            firstName,
            lastName,
            dateOfBirth,
            phone,
            country,
            documentType,
            documentNumber,
            documentFront: frontImageUrl,
            documentBack: backImageUrl,
            kycStatus: "pending",
        });
        await user.save();
        res.status(200).json({ message: "KYC completed successfully.", user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.completeKYC = completeKYC;
//Delete Kyc
const deleteKyc = async (req, res) => {
    try {
        const { userId } = req.params;
        // Find user
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // Reset KYC fields
        user.kycStatus = "notSubmitted";
        user.dateOfBirth = "";
        user.phone = "";
        user.country = "";
        user.documentType = "";
        user.documentNumber = "";
        user.documentFront = "";
        user.documentBack = "";
        await user.save();
        res.json({ message: "KYC data deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteKyc = deleteKyc;
//Approve Kyc
const approveKyc = async (req, res) => {
    try {
        const { userId } = req.params;
        // Find user
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        user.kycStatus = "approved";
        await user.save();
        res.json({ message: "KYC data approved successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
exports.approveKyc = approveKyc;
// ✅ Update User (Admin)
const updateUserByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateFields = req.body;
        // Find the user
        const user = await userModel_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found." });
        // Update only provided fields
        Object.keys(updateFields).forEach((key) => {
            if (updateFields[key] !== undefined) {
                user.set(key, updateFields[key]);
            }
        });
        await user.save();
        res.status(200).json({ message: "User updated successfully.", user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateUserByAdmin = updateUserByAdmin;
