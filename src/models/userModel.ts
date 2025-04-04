import { Schema, Document, model, Types } from "mongoose";
import { UserType } from "../validation/schemas";

// Define the User Document Interface
export interface IUser extends Document, UserType {
	_id: Types.ObjectId;
	uid: string;
}

// Default assets with zero balances
const defaultAssets = [
	{ symbol: "BTC", funding: 0, spot: 0, name: "Bitcoin", address: "", network: "BTC", status: "activated" },
	{
		symbol: "ETH",
		funding: 0,
		spot: 0,
		name: "Ethereum",
		address: "",
		network: "ERC20",
		status: "activated",
	},
	{ symbol: "USDT", funding: 0, spot: 0, name: "Tether", address: "", network: "ERC20", status: "activated" },
	{ symbol: "ATOM", funding: 0, spot: 0, name: "Cosmos", address: "", network: "ATOM", status: "activated" },
	{ symbol: "SOL", funding: 0, spot: 0, name: "Solana", address: "", network: "SOL", status: "activated" },
];

// Create the Mongoose Schema
const UserSchema = new Schema<IUser>(
	{
		firstName: { type: String },
		lastName: { type: String },
		dateOfBirth: { type: String },
		phone: { type: String },
		country: { type: String },
		documentType: { type: String },
		documentNumber: { type: String },
		documentFront: { type: String },
		documentBack: { type: String },

		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		withdrawalPassword: { type: String },
		referral: {
			type: {
				code: String,
				status: { type: String, enum: ["claimed", "none", "pending"], default: "none" },
			},
		},
		isEmailVerified: { type: Boolean, default: false },
		kycStatus: {
			type: String,
			enum: ["notSubmitted", "pending", "approved", "rejected"],
			default: "notSubmitted",
		},

		tradingStatus: { type: String, default: "None" },
		tradingLevel: { type: String, default: "None" },
		tradingLimit: { type: String, default: "None" },
		isTradeSuspended: { type: Boolean, default: false },
		minDeposit: { type: Number, default: 100 },
		maxDeposit: { type: Number, default: 1000000000 },
		minWithdrawal: { type: Number, default: 100 },
		maxWithdrawal: { type: Number, default: 1000000000 },

		assets: {
			type: [
				{
					symbol: { type: String },
					funding: { type: Number },
					spot: { type: Number },
					name: { type: String },
					address: { type: String },
					network: { type: String },
					status: { type: String, enum: ["activated", "suspended"], default: "activated" },
				},
			],
			default: defaultAssets,
		},

		uid: { type: String, unique: true },
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},

		accountStatus: { type: String, enum: ["active", "suspended", "deactivated"], default: "active" },
	},
	{ timestamps: true },
);

// ✅ Generate Short UID before saving a new user
UserSchema.pre("save", async function (next) {
	if (!this.uid) {
		this.uid = this._id.toString().slice(-6); // Short UID from _id
	}
	next();
});

// Create and Export the Model
const User = model<IUser>("User", UserSchema);
export default User;
