"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCode = void 0;
const codeSchema_1 = __importDefault(require("../models/codeSchema"));
//  Validates if a code is correct and has not expired.
const validateCode = async (email, inputCode) => {
    const storedCode = await codeSchema_1.default.findOne({ email });
    if (!storedCode)
        return false;
    if (storedCode.code !== inputCode)
        return false;
    return true;
};
exports.validateCode = validateCode;
