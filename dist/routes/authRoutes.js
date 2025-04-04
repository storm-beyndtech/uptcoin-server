"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthControllers_1 = require("../controllers/AuthControllers");
const PasswordControllers_1 = require("../controllers/PasswordControllers");
const multer_1 = __importDefault(require("../utils/multer"));
const UserControllers_1 = require("../controllers/UserControllers");
const router = (0, express_1.Router)();
//Basic auth routes
router.get("/users/:id", AuthControllers_1.getUser);
router.get("/users", AuthControllers_1.getAllUsers);
router.get("/check-withdrawal-password/:userId", PasswordControllers_1.checkWithdrawalPassword);
router.post("/registration-code", AuthControllers_1.requestVerificationCode);
router.post("/register", AuthControllers_1.register);
router.post("/add-user", AuthControllers_1.addUser);
router.post("/login", AuthControllers_1.login);
router.put("/update-user/:userId", UserControllers_1.updateUserByAdmin);
//Password routes
router.post("/reset-password-code", PasswordControllers_1.requestResetCode);
router.put("/reset-password", PasswordControllers_1.resetPassword);
router.put("/update-account-password", PasswordControllers_1.updateAccountPassword);
router.put("/set-withdrawal-password", PasswordControllers_1.setWithdrawalPassword);
//manage assets routes
router.post("/add-asset", UserControllers_1.addAsset);
router.put("/update-asset-address", UserControllers_1.updateAssetAddress);
router.delete("/delete-asset", UserControllers_1.deleteAsset);
router.put("/reject-kyc/:userId", UserControllers_1.deleteKyc);
router.put("/approve-kyc/:userId", UserControllers_1.approveKyc);
router.put("/complete-kyc", multer_1.default.fields([{ name: "documentFront" }, { name: "documentBack" }]), UserControllers_1.completeKYC);
exports.default = router;
