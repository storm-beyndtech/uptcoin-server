import { Schema, model, Document, Types } from "mongoose";

export interface ITrade extends Document {
	userId: Types.ObjectId;
	action: "buy" | "sell";
	orderType: "market" | "limit";
	symbol: string;
	amount?: number;
  limitPrice?: number;
  marketPrice?: number;
	quantity: number;
	status: "pending" | "executed" | "canceled" | "rejected";
	createdAt: Date;
	updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		action: { type: String, enum: ["buy", "sell"], required: true },
		orderType: { type: String, enum: ["market", "limit"], required: true },
		symbol: { type: String, required: true },
		amount: { type: Number, required: true },
		limitPrice: { type: Number },
		marketPrice: { type: Number },
		quantity: { type: Number, required: true },
		status: { type: String, enum: ["pending", "executed", "canceled", "rejected"], default: "pending" },
	},
	{ timestamps: true },
);

const Trade = model<ITrade>("Trade", TradeSchema);
export default Trade;
