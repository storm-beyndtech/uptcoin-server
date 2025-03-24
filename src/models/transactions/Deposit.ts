import { Schema, model, Document, Types } from "mongoose";

export interface IDeposit extends Document {
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  address: string;
  network: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepositSchema = new Schema<IDeposit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    address: { type: String, required: true },
    network: { type: String, required: true },
  },
  { timestamps: true }
);

const Deposit = model<IDeposit>("Deposit", DepositSchema);
export default Deposit;
