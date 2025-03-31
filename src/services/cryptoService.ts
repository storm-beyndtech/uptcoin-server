import WebSocket from "ws";
import { Server } from "http";
import { Coin } from "../models/coinModel";
import { handlePriceUpdate } from "./tradeEngine";
import { symbol } from "zod";

const CRYPTOCOMPARE_WS_URL = `wss://streamer.cryptocompare.com/v2?api_key=${process.env.CRYPTOCOMPARE_API_KEY}`;
const clients = new Set<WebSocket>();
let ws: WebSocket;

export const coinCache: Record<string, any> = {};

export const startCryptoWebSocket = async () => {
	try {
		// Fetch available coins from the database
		const coins = await Coin.find({});
		const subscribedCoins = coins.map(
			({ symbol, margin, address, network, withdrawalFee, conversionFee }) => {
				return {
					symbol,
					margin,
					address,
					network,
					withdrawalFee,
					conversionFee,
				};
			},
		);

		if (subscribedCoins.length === 0) return console.error("No coins available in the database.");

		ws = new WebSocket(CRYPTOCOMPARE_WS_URL);

		//Subscribe to CC
		ws.on("open", () => {
			console.log("Connected to CryptoCompare WebSocket");
			const subRequest = {
				action: "SubAdd",
				subs: subscribedCoins.map((coin) => `5~CCCAGG~${coin.symbol}~USDT`),
			};
			ws.send(JSON.stringify(subRequest));
		});

		//Extract Data from CC and send to clients
		ws.on("message", (data: WebSocket.RawData) => {
			try {
				const parsedData = JSON.parse(data.toString());

				// Extract relevant fields
				const { TYPE, FROMSYMBOL, PRICE, OPEN24HOUR, LOW24HOUR, HIGH24HOUR, VOLUME24HOURTO } = parsedData;

				// Filter out irrelevant messages
				if (TYPE !== "5") return;

				// Check if the coin is valid and avoid sending 0 values
				if (!FROMSYMBOL || (!PRICE && !coinCache[FROMSYMBOL])) return;
				// Find the corresponding coin details
				const coinInfo = coins.find((coin) => coin.symbol === FROMSYMBOL);
				const coinName = coinInfo ? coinInfo.name : FROMSYMBOL;
				const coinID = coinInfo ? coinInfo._id : FROMSYMBOL;

				//Initialize USDT first
				if (!coinCache["USDT"]) {
					const usdt = coins.find((coin) => coin.symbol === "USDT");
					coinCache["USDT"] = {
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
						address: usdt ? usdt.address : "",
						network: "Ethereum (ERC20)",
						withdrawalFee: usdt ? usdt.withdrawalFee : 0,
						conversionFee: usdt ? usdt.conversionFee : 0,
						minDeposit: usdt ? usdt.minDeposit : 0,
						minWithdraw: usdt ? usdt.minWithdraw : 0,
					};
				}

				// Initialize cache if not already set
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
						address: coinInfo ? coinInfo.address : "",
						network: coinInfo ? coinInfo.network : "",
						withdrawalFee: coinInfo ? coinInfo.withdrawalFee : "",
						conversionFee: coinInfo ? coinInfo.conversionFee : "",
						minDeposit: coinInfo ? coinInfo.minDeposit : "",
						minWithdraw: coinInfo ? coinInfo.minWithdraw : "",
					};
				}

				// Update only the available fields
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

				// console.log(coinCache)

				handlePriceUpdate({ symbol: FROMSYMBOL, price: PRICE });

				// Broadcast update to all connected clients
				clients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						// Send the received coin update first
						client.send(JSON.stringify(coinCache[FROMSYMBOL]));

						// Also send USDT separately
						if (coinCache["USDT"]) {
							client.send(JSON.stringify(coinCache["USDT"]));
						}
					}
				});
			} catch (error) {
				console.error("Error Processing WebSocket Message:", error);
			}
		});

		ws.on("close", (code, reason) => {
			console.log(`CryptoCompare WebSocket closed: Code ${code}, Reason: ${reason}`);
			setTimeout(startCryptoWebSocket, 10000);
		});

		ws.on("error", (error) => {
			console.error("CryptoCompare WebSocket error:", error);
		});
	} catch (error) {
		console.error("Error fetching coins from database:", error);
	}
};

// WebSocket Server for Frontend
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
