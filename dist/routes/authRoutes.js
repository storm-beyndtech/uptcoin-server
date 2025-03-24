"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const router = (0, express_1.Router)();
router.post("/registration-code", auth_1.requestVerificationCode);
router.post("/register", auth_1.register);
router.post("/login", auth_1.login);
router.post("/reset-password-code", auth_1.requestResetCode);
router.post("/reset-password", auth_1.resetPassword);
router.get("/users/:id", auth_1.getUser);
exports.default = router;
