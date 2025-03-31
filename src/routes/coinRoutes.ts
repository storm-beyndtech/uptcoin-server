import express from "express";
import { getCoinBySymbol, getCoins } from "../controllers/transactions/CoinController";

const router = express.Router();

router.get("/", getCoins);
router.get("/:symbol", getCoinBySymbol);

export default router;
