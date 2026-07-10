import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEmailVerificationToken extends Document {
  email:     string;
  otpHash:   string;   // SHA-256 of the 5-digit code — never store raw
  expiresAt: Date;
  attempts:  number;   // wrong-guess counter (max 5)
  usedAt?:   Date;
  createdAt: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    email:    { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash:  { type: String, required: true },
    expiresAt:{ type: Date,   required: true },
    attempts: { type: Number, default: 0 },
    usedAt:   { type: Date },
  },
  { timestamps: true }
);

// MongoDB TTL — auto-deletes the document after expiresAt
EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Delete cached model to force re-registration with the current schema.
// This prevents stale schema from the old `token` field being used.
if (mongoose.models.EmailVerificationToken) {
  delete mongoose.models.EmailVerificationToken;
}

const EmailVerificationToken: Model<IEmailVerificationToken> =
  mongoose.model<IEmailVerificationToken>(
    "EmailVerificationToken",
    EmailVerificationTokenSchema
  );

export default EmailVerificationToken;
