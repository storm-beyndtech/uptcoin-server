"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CoinController_1 = require("../controllers/transactions/CoinController");
const router = express_1.default.Router();
router.get("/", CoinController_1.getCoins);
router.get("/:symbol", CoinController_1.getCoinBySymbol);
exports.default = router;
