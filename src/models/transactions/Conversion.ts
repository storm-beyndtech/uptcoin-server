import { Schema, model, Document, Types } from "mongoose";

export interface IConversion extends Document {
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  exchangeRate: number;
  fee: number;
  from: "spot";
  to: "spot";
  createdAt: Date;
  updatedAt: Date;
}

const ConversionSchema = new Schema<IConversion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    exchangeRate: { type: Number, required: true },
    fee: { type: Number, required: true },
    from: { type: String, enum: ["spot"], required: true },
    to: { type: String, enum: ["spot"], required: true },
  },
  { timestamps: true }
);

const Conversion = model<IConversion>("Conversion", ConversionSchema);
export default Conversion;