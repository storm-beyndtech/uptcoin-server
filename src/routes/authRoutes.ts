import { Router } from "express";
import {
	addUser,
	getAllUsers,
	getUser,
	login,
	register,
	requestVerificationCode,
} from "../controllers/AuthControllers";
import {
	checkWithdrawalPassword,
	requestResetCode,
	resetPassword,
	setWithdrawalPassword,
	updateAccountPassword,
} from "../controllers/PasswordControllers";
import upload from "../utils/multer";
import {
	addAsset,
	approveKyc,
	completeKYC,
	deleteAsset,
	deleteKyc,
	updateAssetAddress,
	updateUserByAdmin,
} from "../controllers/UserControllers";

const router = Router();

//Basic auth routes
router.get("/users/:id", getUser);
router.get("/users", getAllUsers);
router.get("/check-withdrawal-password/:userId", checkWithdrawalPassword);
router.post("/registration-code", requestVerificationCode);
router.post("/register", register);
router.post("/add-user", addUser);
router.post("/login", login);
router.put("/update-user/:userId", updateUserByAdmin);

//Password routes
router.post("/reset-password-code", requestResetCode);
router.put("/reset-password", resetPassword);
router.put("/update-account-password", updateAccountPassword);
router.put("/set-withdrawal-password", setWithdrawalPassword);

//manage assets routes
router.post("/add-asset", addAsset);
router.put("/update-asset-address", updateAssetAddress);
router.delete("/delete-asset", deleteAsset);
router.put("/reject-kyc/:userId", deleteKyc);
router.put("/approve-kyc/:userId", approveKyc);
router.put(
	"/complete-kyc",
	upload.fields([{ name: "documentFront" }, { name: "documentBack" }]),
	completeKYC,
);

export default router;
