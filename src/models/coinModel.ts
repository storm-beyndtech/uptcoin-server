import { Schema, model, Document } from 'mongoose';

export interface ICoin extends Document {
    symbol: string;
    margin: number;
    charges: number;
    name: string;
    address: string;
    network: string;
    transfer: boolean;
    deposit: boolean;
    withdraw: boolean;
    minWithdraw: number;
    minDeposit: number;
    conversionFee: number;
}

const CoinSchema = new Schema<ICoin>({
    symbol: { type: String, required: true },
    margin: { type: Number, required: true },
    charges: { type: Number, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    network: { type: String, required: true },
    transfer: { type: Boolean, required: true },
    deposit: { type: Boolean, required: true },
    withdraw: { type: Boolean, required: true },
    minWithdraw: { type: Number, required: true },
    minDeposit: { type: Number, required: true },
    conversionFee: { type: Number, required: true },
});

export const Coin = model<ICoin>('Coin', CoinSchema);