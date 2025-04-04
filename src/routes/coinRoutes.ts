import express from "express";
import { addCoin, deleteCoin, getCoinBySymbol, getCoins, updateCoin } from "../controllers/transactions/CoinControllers";

const router = express.Router();

router.get("/", getCoins);
router.get("/:symbol", getCoinBySymbol);
router.post("/create/:symbol", addCoin);
router.put("/update/:symbol", updateCoin);
router.delete("/delete/:symbol", deleteCoin);

export default router;
