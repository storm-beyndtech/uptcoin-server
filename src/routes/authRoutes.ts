import { Router } from "express";
import {
	getUser,
	login,
	register,
	requestResetCode,
	requestVerificationCode,
	resetPassword,
} from "../controllers/auth";

const router = Router();

router.post("/registration-code", requestVerificationCode);
router.post("/register", register);
router.post("/login", login);
router.post("/reset-password-code", requestResetCode);
router.post("/reset-password", resetPassword);
router.get("/users/:id", getUser);

export default router;
