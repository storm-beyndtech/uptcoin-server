"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AdminControllers_1 = require("../controllers/AdminControllers");
const router = express_1.default.Router();
router.post("/send-emails", AdminControllers_1.sendAdminMail);
exports.default = router;
