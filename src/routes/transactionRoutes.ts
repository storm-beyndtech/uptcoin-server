import { Router } from "express";
import { approveDeposit, cancelDeposit, createDeposit, getDepositById, getDeposits, rejectDeposit } from "../controllers/transactions/DepositControllers";
import { approveWithdrawal, cancelWithdrawal, createWithdrawal, getWithdrawalById, getWithdrawals, rejectWithdrawal } from "../controllers/transactions/WithdrawalControllers";
import { getUserTranfers, transferAsset } from "../controllers/transactions/TransferControllers";
import { convertAsset, getUserConversions } from "../controllers/transactions/ConversionControllers";
import { cancelTrade, getAllTrades, getUserTrades, placeTrade } from "../controllers/transactions/TradeControllers";

const router = Router();

//Deposit Routes
router.post("/deposit", createDeposit);
router.get("/deposits", getDeposits);
router.get("/deposit/:id", getDepositById);
router.put("/deposit/approve", approveDeposit);
router.put("/deposit/reject", rejectDeposit);
router.delete("/deposit/:id/cancel", cancelDeposit);


//Withdrawal Routes
router.get("/withdrawals", getWithdrawals);
router.post("/withdraw", createWithdrawal);
router.get("/withdrawal/:id", getWithdrawalById);
router.delete("/cancel/withdrawal/:id", cancelWithdrawal);
router.put("/withdrawal/approve", approveWithdrawal);
router.put("/withdrawal/reject", rejectWithdrawal);


//Transfer with account
router.get("/transfer/:userId", getUserTranfers);
router.post("/transfer", transferAsset);

//Convert Asset
router.get("/convert/:userId", getUserConversions);
router.post("/convert", convertAsset);


//Trade routes
router.get("/trades/:userId", getUserTrades);
router.get("/trades", getAllTrades);
router.post("/trade", placeTrade);
router.put("/trade/:tradeId", cancelTrade);



export default router;