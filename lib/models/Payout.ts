import mongoose, { Document, Model, Schema } from "mongoose";

export type PayoutStatus = "pending" | "under_review" | "paid" | "rejected";

export interface IPayout extends Document {
  userId:        mongoose.Types.ObjectId;
  accountId?:    mongoose.Types.ObjectId;
  accountNumber?:string;
  amount:        number;
  method:        string;           // "Bank Transfer" | "Crypto (USDT)" | ...
  methodDetails?:string;           // wallet address / bank last 4
  status:        PayoutStatus;
  reviewedBy?:   mongoose.Types.ObjectId;
  reviewedAt?:   Date;
  rejectionReason?:string;
  paidAt?:       Date;
  createdAt:     Date;
  updatedAt:     Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: "User",          required: true, index: true },
    accountId:       { type: Schema.Types.ObjectId, ref: "TradingAccount" },
    accountNumber:   { type: String },
    amount:          { type: Number, required: true },
    method:          { type: String, required: true },
    methodDetails:   { type: String },
    status:          { type: String, enum: ["pending","under_review","paid","rejected"], default: "pending" },
    reviewedBy:      { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt:      { type: Date },
    rejectionReason: { type: String },
    paidAt:          { type: Date },
  },
  { timestamps: true }
);

if (mongoose.models.Payout) delete mongoose.models.Payout;
const Payout: Model<IPayout> = mongoose.model<IPayout>("Payout", PayoutSchema);
export default Payout;
