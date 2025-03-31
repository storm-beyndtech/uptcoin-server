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
router.get("/withdrawals", WithdrawalController_1.getWithdrawals);
router.post("/withdraw", WithdrawalController_1.createWithdrawal);
router.get("/withdrawal/:id", WithdrawalController_1.getWithdrawalById);
router.delete("/withdrawal/:id/cancel", WithdrawalController_1.cancelWithdrawal);
router.put("/withdrawal/approve", WithdrawalController_1.approveWithdrawal);
router.put("/withdrawal/reject", WithdrawalController_1.rejectWithdrawal);
//Transfer with account
router.get("/transfer/:userId", TransferController_1.getUserTranfers);
router.post("/transfer", TransferController_1.transferAsset);
//Convert Asset
router.get("/convert/:userId", ConversionController_1.getUserConversions);
router.post("/convert", ConversionController_1.convertAsset);
//Trade routes
router.get("/trades/:userId", TradeController_1.getUserTrades);
router.get("/trades", TradeController_1.getAllTrades);
router.post("/trade", TradeController_1.placeTrade);
router.put("/trade/:tradeId", TradeController_1.cancelTrade);
exports.default = router;
