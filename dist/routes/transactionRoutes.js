"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DepositControllers_1 = require("../controllers/transactions/DepositControllers");
const WithdrawalControllers_1 = require("../controllers/transactions/WithdrawalControllers");
const TransferControllers_1 = require("../controllers/transactions/TransferControllers");
const ConversionControllers_1 = require("../controllers/transactions/ConversionControllers");
const TradeControllers_1 = require("../controllers/transactions/TradeControllers");
const router = (0, express_1.Router)();
//Deposit Routes
router.post("/deposit", DepositControllers_1.createDeposit);
router.get("/deposits", DepositControllers_1.getDeposits);
router.get("/deposit/:id", DepositControllers_1.getDepositById);
router.put("/deposit/approve/:id", DepositControllers_1.approveDeposit);
router.put("/deposit/reject/:id", DepositControllers_1.rejectDeposit);
router.delete("/deposit/:id/cancel", DepositControllers_1.cancelDeposit);
//Withdrawal Routes
router.get("/withdrawals", WithdrawalControllers_1.getWithdrawals);
router.post("/admin/withdraw", WithdrawalControllers_1.adminWithdraw);
router.post("/withdraw", WithdrawalControllers_1.createWithdrawal);
router.get("/withdrawal/:id", WithdrawalControllers_1.getWithdrawalById);
router.delete("/cancel/withdrawal/:id", WithdrawalControllers_1.cancelWithdrawal);
router.put("/withdrawal/approve/:id", WithdrawalControllers_1.approveWithdrawal);
router.put("/withdrawal/reject/:id", WithdrawalControllers_1.rejectWithdrawal);
//Transfer with account
router.get("/transfer/:userId", TransferControllers_1.getUserTranfers);
router.post("/transfer", TransferControllers_1.transferAsset);
//Convert Asset
router.get("/convert/:userId", ConversionControllers_1.getUserConversions);
router.post("/convert", ConversionControllers_1.convertAsset);
//Trade routes
router.get("/trades/:userId", TradeControllers_1.getUserTrades);
router.get("/trades", TradeControllers_1.getAllTrades);
router.post("/trade", TradeControllers_1.placeTrade);
router.put("/trade/:tradeId", TradeControllers_1.cancelTrade);
router.put("/trader/", TradeControllers_1.updateTraderStatus);
exports.default = router;
