"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DepositController_1 = require("../controllers/transactions/DepositController");
const WithdrawalController_1 = require("../controllers/transactions/WithdrawalController");
const TransferController_1 = require("../controllers/transactions/TransferController");
const ConversionController_1 = require("../controllers/transactions/ConversionController");
const TradeController_1 = require("../controllers/transactions/TradeController");
const router = (0, express_1.Router)();
//Deposit Routes
router.post("/deposit", DepositController_1.createDeposit);
router.get("/deposits", DepositController_1.getDeposits);
router.get("/deposit/:id", DepositController_1.getDepositById);
router.put("/deposit/approve", DepositController_1.approveDeposit);
router.put("/deposit/reject", DepositController_1.rejectDeposit);
router.delete("/deposit/:id/cancel", DepositController_1.cancelDeposit);
//Withdrawal Routes
router.post("/withdraw", WithdrawalController_1.createWithdrawal);
router.get("/withdrawals", WithdrawalController_1.getWithdrawals);
router.get("/withdrawal/:id", WithdrawalController_1.getWithdrawalById);
router.put("/withdrawal/approve", WithdrawalController_1.approveWithdrawal);
router.put("/withdrawal/reject", WithdrawalController_1.rejectWithdrawal);
router.delete("/withdrawal/:id/cancel", WithdrawalController_1.cancelWithdrawal);
//Transfer with account
router.post("/transfer", TransferController_1.transferAsset);
//Convert Asset
router.post("/convert", ConversionController_1.convertAsset);
//Trade
router.post("/trade", TradeController_1.placeTrade);
exports.default = router;
