import WebSocket from "ws";
import { Coin } from "../models/coinModel";
import { handlePriceUpdate } from "./tradeEngine";
import { Server } from "http";

const CRYPTOCOMPARE_WS_URL = `wss://streamer.cryptocompare.com/v2?api_key=${process.env.CRYPTOCOMPARE_API_KEY}`;
const clients = new Set<WebSocket>();
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let heartbeatInterval: NodeJS.Timeout | null = null;
let heartbeatTimeout: NodeJS.Timeout | null = null;

export const coinCache: Record<string, any> = {};

const getSubscribedCoins = async () => {
	const coins = await Coin.find({});
	return coins.map(
		({
			symbol,
			margin,
			address,
			network,
			withdrawalFee,
			conversionFee,
			minDeposit,
			minWithdraw,
			name,
			_id,
		}) => ({
			symbol,
			margin,
			address,
			network,
			withdrawalFee,
			conversionFee,
			minDeposit,
			minWithdraw,
			name,
			_id,
		}),
	);
};

const subscribeToCoins = (subscribedCoins: any[]) => {
	if (ws && ws.readyState === WebSocket.OPEN) {
		const subRequest = {
			action: "SubAdd",
			subs: subscribedCoins.map((coin) => `5~CCCAGG~${coin.symbol}~USDT`),
		};
		ws.send(JSON.stringify(subRequest));
	}
};

const setupHeartbeat = () => {
	if (heartbeatInterval) clearInterval(heartbeatInterval);
	if (heartbeatTimeout) clearTimeout(heartbeatTimeout);

	heartbeatInterval = setInterval(() => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			console.log("Sending ping...");
			ws.ping();
			heartbeatTimeout = setTimeout(() => {
				console.warn("Heartbeat timeout. Terminating connection.");
				ws?.terminate();
			}, 10000); // Wait 10 seconds for pong
		}
	}, 30000); // Send ping every 30 seconds
};

const cleanup = () => {
	if (heartbeatInterval) clearInterval(heartbeatInterval);
	if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
	heartbeatInterval = null;
	heartbeatTimeout = null;
};

const reconnect = async () => {
	cleanup();
	reconnectAttempts++;
	const delay = Math.min(10000, 1000 * reconnectAttempts); // exponential backoff
	console.log(`Reconnecting in ${delay / 1000}s...`);
	setTimeout(() => {
		startCryptoWebSocket(); // attempt reconnection
	}, delay);
};

export const startCryptoWebSocket = async () => {
	try {
		const subscribedCoins = await getSubscribedCoins();

		if (subscribedCoins.length === 0) {
			console.error("No coins found in the database to subscribe to.");
			return;
		}

		if (ws) {
			ws.removeAllListeners();
			ws.terminate();
		}

		ws = new WebSocket(CRYPTOCOMPARE_WS_URL);

		ws.on("open", () => {
			console.log("✅ Connected to CryptoCompare WebSocket");
			reconnectAttempts = 0;
			subscribeToCoins(subscribedCoins);
			setupHeartbeat();
		});

		ws.on("message", (data: WebSocket.RawData) => {
			try {
				const parsedData = JSON.parse(data.toString());
				const { TYPE, FROMSYMBOL, PRICE, OPEN24HOUR, LOW24HOUR, HIGH24HOUR, VOLUME24HOURTO } = parsedData;

				if (TYPE !== "5") return;
				if (!FROMSYMBOL || (!PRICE && !coinCache[FROMSYMBOL])) return;

				const coinInfo = subscribedCoins.find((coin) => coin.symbol === FROMSYMBOL);
				const coinName = coinInfo?.name || FROMSYMBOL;
				const coinID = coinInfo?._id || FROMSYMBOL;

				if (!coinCache["USDT"]) {
					const usdt = subscribedCoins.find((coin) => coin.symbol === "USDT");
					coinCache["USDT"] = {
						id: usdt?._id || "tether",
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

				if (!coinCache[FROMSYMBOL]) {
					coinCache[FROMSYMBOL] = {
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

				if (PRICE) {
					coinCache[FROMSYMBOL].price = coinInfo ? PRICE * (1 + coinInfo.margin / 100) : PRICE;
					coinCache[FROMSYMBOL].time = Date.now();
				}
				if (OPEN24HOUR && OPEN24HOUR !== 0 && PRICE) {
					coinCache[FROMSYMBOL].change = ((PRICE - OPEN24HOUR) / OPEN24HOUR) * 100;
				}
				if (LOW24HOUR) coinCache[FROMSYMBOL].low = LOW24HOUR;
				if (HIGH24HOUR) coinCache[FROMSYMBOL].high = HIGH24HOUR;
				if (VOLUME24HOURTO) coinCache[FROMSYMBOL].volume = VOLUME24HOURTO;

				handlePriceUpdate({ symbol: FROMSYMBOL, price: PRICE });

				clients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(JSON.stringify(coinCache[FROMSYMBOL]));
						if (FROMSYMBOL !== "USDT" && coinCache["USDT"]) {
							client.send(JSON.stringify(coinCache["USDT"]));
						}
					}
				});
			} catch (error) {
				console.error("Error processing message:", error);
			}
		});

		ws.on("pong", () => {
			if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
		});

		ws.on("error", (err) => {
			console.error("❌ WebSocket error:", err.message);
		});

		ws.on("close", (code, reason) => {
			console.warn(`⚠️ WebSocket closed: ${code} - ${reason.toString()}`);
			reconnect();
		});
	} catch (err) {
		console.error("Failed to start Crypto WebSocket:", err);
		reconnect();
	}
};

// WebSocket Server for frontend
export const handleCryptoWebSocket = (server: Server) => {
	const wss = new WebSocket.Server({ server });

	wss.on("connection", (ws) => {
		console.log("Frontend WebSocket connected");
		clients.add(ws);

		ws.on("close", () => {
			clients.delete(ws);
			console.log("Frontend WebSocket disconnected");
		});
	});
};
