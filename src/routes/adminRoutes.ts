import express from "express";
import { sendAdminMail } from "../controllers/AdminControllers";

const router = express.Router();

router.post("/send-emails", sendAdminMail);

export default router;
