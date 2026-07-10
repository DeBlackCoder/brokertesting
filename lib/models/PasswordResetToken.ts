import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPasswordResetToken extends Document {
  email:     string;
  otpHash:   string;   // SHA-256 of 5-digit OTP
  expiresAt: Date;
  attempts:  number;
  usedAt?:   Date;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    email:    { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash:  { type: String, required: true },
    expiresAt:{ type: Date,   required: true },
    attempts: { type: Number, default: 0 },
    usedAt:   { type: Date },
  },
  { timestamps: true }
);

// Auto-delete after expiry
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

if (mongoose.models.PasswordResetToken) delete mongoose.models.PasswordResetToken;
const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);

export default PasswordResetToken;
