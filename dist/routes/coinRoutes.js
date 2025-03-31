"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CoinControllers_1 = require("../controllers/transactions/CoinControllers");
const router = express_1.default.Router();
router.get("/", CoinControllers_1.getCoins);
router.get("/:symbol", CoinControllers_1.getCoinBySymbol);
exports.default = router;
