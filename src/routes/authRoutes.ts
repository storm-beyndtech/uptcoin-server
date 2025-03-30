import { Router } from "express";
import {
	getUser,
	login,
	register,
	requestVerificationCode,
} from "../controllers/auth";
import { checkWithdrawalPassword, requestResetCode, resetPassword, setWithdrawalPassword, updateAccountPassword } from "../controllers/PasswordControllers";

const router = Router();

router.get("/users/:id", getUser);
router.get("/check-withdrawal-password/:userId", checkWithdrawalPassword);
router.post("/registration-code", requestVerificationCode);
router.post("/register", register);
router.post("/login", login);
router.post("/reset-password-code", requestResetCode);
router.put("/reset-password", resetPassword);
router.put("/update-account-password", updateAccountPassword);
router.put("/set-withdrawal-password", setWithdrawalPassword);

export default router;
