import { Schema, model, Document, Types } from "mongoose";

export interface ITransfer extends Document {
	userId: Types.ObjectId;
	amount: number;
	currency: string;
	status: "pending" | "approved" | "rejected";
	from: "spot" | "funding";
	to: "spot" | "funding";
	createdAt: Date;
	updatedAt: Date;
}

const TransferSchema = new Schema<ITransfer>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		amount: { type: Number, required: true },
		currency: { type: String, required: true },
		status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
		from: { type: String, enum: ["spot", "funding"], required: true },
		to: { type: String, enum: ["spot", "funding"], required: true },
	},
	{ timestamps: true },
);

const Transfer = model<ITransfer>("Transfer", TransferSchema);
export default Transfer;
