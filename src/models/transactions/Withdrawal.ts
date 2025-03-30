import { Schema, model, Document, Types } from "mongoose";

export interface IWithdrawal extends Document {
	userId: Types.ObjectId;
	amount: number;
	symbol: string;
	status: "pending" | "approved" | "rejected";
	address: string;
	network: string;
	fee: number;
	createdAt: Date;
	updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		amount: { type: Number, required: true },
		symbol: { type: String, required: true },
		status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
		address: { type: String, required: true },
		network: { type: String, required: true },
		fee: { type: Number, required: true },
	},
	{ timestamps: true },
);

const Withdrawal = model<IWithdrawal>("Withdrawal", WithdrawalSchema);
export default Withdrawal;
