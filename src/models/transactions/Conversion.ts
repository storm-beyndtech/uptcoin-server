import { Schema, model, Document, Types } from "mongoose";

export interface IConversion extends Document {
	userId: Types.ObjectId;
	status: "pending" | "approved" | "rejected";
	fee: number;
	from: {
		symbol: string;
		amount: number;
		price: number;
	};
	to: {
		symbol: string;
		amount: number;
		price: number;
	};
	createdAt: Date;
	updatedAt: Date;
}

const ConversionSchema = new Schema<IConversion>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
		fee: { type: Number, required: true },
		from: {
			type: {
				symbol: String,
				amount: Number,
				price: Number,
			},
			required: true,
		},
		to: {
			type: {
				symbol: String,
				amount: Number,
				price: Number,
			},
			required: true,
		},
	},
	{ timestamps: true },
);

const Conversion = model<IConversion>("Conversion", ConversionSchema);
export default Conversion;
