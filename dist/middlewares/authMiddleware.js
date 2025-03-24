"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const TokenPayload = zod_1.z.object({
    _id: zod_1.z.string(),
});
const authMiddleware = () => {
    return (req, res, next) => {
        if (req.path === "/login-with-token") {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token)
                return res.status(401).json({ message: "No token provided" });
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "");
                const validatedPayload = TokenPayload.parse(decoded);
                req.user = validatedPayload;
                next();
            }
            catch (error) {
                res.status(401).json({ message: "Invalid or expired token" });
            }
        }
        else
            next();
    };
};
exports.authMiddleware = authMiddleware;
