import mongoose, { Document, Model, Schema } from "mongoose";

export type AlertDirection = "above" | "below";
export type AlertStatus = "active" | "triggered" | "cancelled";

export interface IPriceAlert extends Document {
  userId:    mongoose.Types.ObjectId;
  symbol:    string;   // e.g. "BTC/USD"
  base:      string;   // e.g. "BTC"
  price:     number;
  direction: AlertDirection;
  status:    AlertStatus;
  note?:     string;
  triggeredAt?: Date;
  createdAt: Date;
}

const PriceAlertSchema = new Schema<IPriceAlert>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    symbol:      { type: String, required: true },
    base:        { type: String, required: true },
    price:       { type: Number, required: true },
    direction:   { type: String, enum: ["above","below"], required: true },
    status:      { type: String, enum: ["active","triggered","cancelled"], default: "active", index: true },
    note:        { type: String },
    triggeredAt: { type: Date },
  },
  { timestamps: true }
);

if (mongoose.models.PriceAlert) delete mongoose.models.PriceAlert;
const PriceAlert: Model<IPriceAlert> = mongoose.model<IPriceAlert>("PriceAlert", PriceAlertSchema);
export default PriceAlert;
