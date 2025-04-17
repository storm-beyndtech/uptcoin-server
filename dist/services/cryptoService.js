"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCryptoWebSocket = exports.startCryptoWebSocket = exports.coinCache = void 0;
const ws_1 = __importDefault(require("ws"));
const coinModel_1 = require("../models/coinModel");
const tradeEngine_1 = require("./tradeEngine");
const CRYPTOCOMPARE_WS_URL = `wss://streamer.cryptocompare.com/v2?api_key=${process.env.CRYPTOCOMPARE_API_KEY}`;
const clients = new Set();
let ws;
exports.coinCache = {};
const startCryptoWebSocket = async () => {
    try {
        const coins = await coinModel_1.Coin.find({});
        const subscribedCoins = coins.map(({ symbol, margin, address, network, withdrawalFee, conversionFee }) => ({
            symbol,
            margin,
            address,
            network,
            withdrawalFee,
            conversionFee,
        }));
        if (subscribedCoins.length === 0)
            return console.error("No coins available in the database.");
        ws = new ws_1.default(CRYPTOCOMPARE_WS_URL);
        ws.on("open", () => {
            console.log("Connected to CryptoCompare WebSocket");
            const subRequest = {
                action: "SubAdd",
                subs: subscribedCoins.map((coin) => `5~CCCAGG~${coin.symbol}~USDT`),
            };
            ws.send(JSON.stringify(subRequest));
        });
        ws.on("message", (data) => {
            try {
                const parsedData = JSON.parse(data.toString());
                const { TYPE, FROMSYMBOL, PRICE, OPEN24HOUR, LOW24HOUR, HIGH24HOUR, VOLUME24HOURTO } = parsedData;
                if (TYPE !== "5")
                    return;
                if (!FROMSYMBOL || (!PRICE && !exports.coinCache[FROMSYMBOL]))
                    return;
                const coinInfo = coins.find((coin) => coin.symbol === FROMSYMBOL);
                const coinName = coinInfo ? coinInfo.name : FROMSYMBOL;
                const coinID = coinInfo ? coinInfo._id : FROMSYMBOL;
                // Initialize USDT once
                if (!exports.coinCache["USDT"]) {
                    const usdt = coins.find((coin) => coin.symbol === "USDT");
                    exports.coinCache["USDT"] = {
                        id: usdt ? usdt._id : "tether",
                        name: "Tether",
                        symbol: "USDT",
                        price: 1.0,
                        change: 0,
                        low: 1.0,
                        high: 1.0,
                        volume: 0,
                        time: Date.now(),
                        image: "https://assets.coincap.io/assets/icons/tether2@2x.png",
                        address: usdt?.address || "",
                        network: "Ethereum (ERC20)",
                        withdrawalFee: usdt?.withdrawalFee || 0,
                        conversionFee: usdt?.conversionFee || 0,
                        minDeposit: usdt?.minDeposit || 0,
                        minWithdraw: usdt?.minWithdraw || 0,
                    };
                }
                // Initialize coin cache if missing
                if (!exports.coinCache[FROMSYMBOL]) {
                    exports.coinCache[FROMSYMBOL] = {
                        id: coinID,
                        name: coinName,
                        symbol: FROMSYMBOL,
                        price: 0,
                        change: 0,
                        low: 0,
                        high: 0,
                        volume: 0,
                        time: Date.now(),
                        image: `https://assets.coincap.io/assets/icons/${FROMSYMBOL.toLowerCase()}@2x.png`,
                        address: coinInfo?.address || "",
                        network: coinInfo?.network || "",
                        withdrawalFee: coinInfo?.withdrawalFee || 0,
                        conversionFee: coinInfo?.conversionFee || 0,
                        minDeposit: coinInfo?.minDeposit || 0,
                        minWithdraw: coinInfo?.minWithdraw || 0,
                    };
                }
                // Update live data
                if (PRICE) {
                    exports.coinCache[FROMSYMBOL].price = coinInfo ? PRICE * (1 + coinInfo.margin / 100) : PRICE;
                    exports.coinCache[FROMSYMBOL].time = Date.now();
                }
                if (OPEN24HOUR && OPEN24HOUR !== 0 && PRICE) {
                    exports.coinCache[FROMSYMBOL].change = ((PRICE - OPEN24HOUR) / OPEN24HOUR) * 100;
                }
                if (LOW24HOUR)
                    exports.coinCache[FROMSYMBOL].low = LOW24HOUR;
                if (HIGH24HOUR)
                    exports.coinCache[FROMSYMBOL].high = HIGH24HOUR;
                if (VOLUME24HOURTO)
                    exports.coinCache[FROMSYMBOL].volume = VOLUME24HOURTO;
                (0, tradeEngine_1.handlePriceUpdate)({ symbol: FROMSYMBOL, price: PRICE });
                // Broadcast to frontend clients
                clients.forEach((client) => {
                    if (client.readyState === ws_1.default.OPEN) {
                        client.send(JSON.stringify(exports.coinCache[FROMSYMBOL]));
                        // Also send USDT if it's not the same coin
                        if (FROMSYMBOL !== "USDT" && exports.coinCache["USDT"]) {
                            client.send(JSON.stringify(exports.coinCache["USDT"]));
                        }
                    }
                });
            }
            catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        });
        ws.on("close", (code, reason) => {
            console.log(`CryptoCompare WebSocket closed: Code ${code}, Reason: ${reason}`);
            setTimeout(exports.startCryptoWebSocket, 10000);
        });
        ws.on("error", (error) => {
            console.error("CryptoCompare WebSocket error:", error);
        });
    }
    catch (error) {
        console.error("Error initializing Crypto WebSocket:", error);
    }
};
exports.startCryptoWebSocket = startCryptoWebSocket;
// WebSocket Server for frontend
const handleCryptoWebSocket = (server) => {
    const wss = new ws_1.default.Server({ server });
    wss.on("connection", (ws) => {
        console.log("Frontend WebSocket connected");
        clients.add(ws);
        ws.on("close", () => {
            clients.delete(ws);
            console.log("Frontend WebSocket disconnected");
        });
    });
};
exports.handleCryptoWebSocket = handleCryptoWebSocket;
