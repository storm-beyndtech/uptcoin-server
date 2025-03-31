"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_1 = require("../controllers/Auth");
const PasswordControllers_1 = require("../controllers/PasswordControllers");
const multer_1 = __importDefault(require("../utils/multer"));
const UserController_1 = require("../controllers/UserController");
const router = (0, express_1.Router)();
//Basic auth routes
router.get("/users/:id", Auth_1.getUser);
router.get("/check-withdrawal-password/:userId", PasswordControllers_1.checkWithdrawalPassword);
router.post("/registration-code", Auth_1.requestVerificationCode);
router.post("/register", Auth_1.register);
router.post("/login", Auth_1.login);
//Password routes
router.post("/reset-password-code", PasswordControllers_1.requestResetCode);
router.put("/reset-password", PasswordControllers_1.resetPassword);
router.put("/update-account-password", PasswordControllers_1.updateAccountPassword);
router.put("/set-withdrawal-password", PasswordControllers_1.setWithdrawalPassword);
//manage assets routes
router.post("/add-asset", UserController_1.addAsset);
router.delete("/delete-asset", UserController_1.deleteAsset);
router.delete("/delete-kyc/:userId", UserController_1.deleteKyc);
router.put("/complete-kyc", multer_1.default.fields([{ name: "documentFront" }, { name: "documentBack" }]), UserController_1.completeKYC);
exports.default = router;
