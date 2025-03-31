import { Router } from "express";
import { getUser, login, register, requestVerificationCode } from "../controllers/Auth";
import {
	checkWithdrawalPassword,
	requestResetCode,
	resetPassword,
	setWithdrawalPassword,
	updateAccountPassword,
} from "../controllers/PasswordControllers";
import upload from "../utils/multer";
import { addAsset, completeKYC, deleteAsset, deleteKyc } from "../controllers/UserController";

const router = Router();

//Basic auth routes
router.get("/users/:id", getUser);
router.get("/check-withdrawal-password/:userId", checkWithdrawalPassword);
router.post("/registration-code", requestVerificationCode);
router.post("/register", register);
router.post("/login", login);

//Password routes
router.post("/reset-password-code", requestResetCode);
router.put("/reset-password", resetPassword);
router.put("/update-account-password", updateAccountPassword);
router.put("/set-withdrawal-password", setWithdrawalPassword);

//manage assets routes
router.post("/add-asset", addAsset);
router.delete("/delete-asset", deleteAsset);
router.delete("/delete-kyc/:userId", deleteKyc);
router.put(
	"/complete-kyc",
	upload.fields([{ name: "documentFront" }, { name: "documentBack" }]),
	completeKYC,
);

export default router;
