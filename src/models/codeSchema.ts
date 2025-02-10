import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the document
interface IVerificationCode extends Document {
  email: string;
  code: string;
  createdAt: Date;
}

// Define the schema
const VerificationCodeSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 225,
  },
  code: {
    type: String,
    default: function () {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes in seconds
  }
});

// Create the model
const VerificationCode = mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema);

export default VerificationCode;