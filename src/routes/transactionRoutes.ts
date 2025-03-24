import { Router } from "express";
import { approveDeposit, createDeposit, getDepositById, getDeposits, rejectDeposit } from "../controllers/transactions/DepositController";
import { approveWithdrawal, createWithdrawal, getWithdrawalById, getWithdrawals, rejectWithdrawal } from "../controllers/transactions/WithdrawalController";
import { transferAsset } from "../controllers/transactions/TransferController";
import { convertAsset } from "../controllers/transactions/ConversionController";
import { placeTrade } from "../controllers/transactions/TradeController";

const router = Router();

//Deposit Routes
router.post("/deposit", createDeposit);
router.get("/deposits", getDeposits);
router.get("/deposit/:id", getDepositById);
router.put("/deposit/approve", approveDeposit);
router.put("/deposit/reject", rejectDeposit);


//Withdrawal Routes
router.post("/withdraw", createWithdrawal);
router.get("/withdrawals", getWithdrawals);
router.get("/withdrawal/:id", getWithdrawalById);
router.put("/withdrawal/approve", approveWithdrawal);
router.put("/withdrawal/reject", rejectWithdrawal);


//Transfer with account
router.post("/transfer", transferAsset);

//Convert Asset
router.post("/convert", convertAsset);

//Trade
router.post("/trade", placeTrade);


export default router;