"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLoginToken = exports.generateEmailToken = exports.jwtSecretKey = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.jwtSecretKey = process.env.JWT_PRIVATE_KEY;
const generateEmailToken = (_id, email) => {
    return jsonwebtoken_1.default.sign({ _id, email }, exports.jwtSecretKey, { expiresIn: "365d" });
};
exports.generateEmailToken = generateEmailToken;
const generateLoginToken = (_id) => {
    return jsonwebtoken_1.default.sign({ _id }, exports.jwtSecretKey, { expiresIn: "1d" });
};
exports.generateLoginToken = generateLoginToken;
