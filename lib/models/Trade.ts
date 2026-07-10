import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITrade extends Document {
  userId:        mongoose.Types.ObjectId;
  accountId:     mongoose.Types.ObjectId;
  accountNumber: string;
  symbol:        string;
  type:          "buy" | "sell";
  volume:        number;
  openPrice:     number;
  closePrice:    number;
  openTime:      Date;
  closeTime?:    Date;
  profit:        number;
  commission:    number;
  swap:          number;
  isOpen:        boolean;
  createdAt:     Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: "User",          required: true, index: true },
    accountId:     { type: Schema.Types.ObjectId, ref: "TradingAccount",required: true, index: true },
    accountNumber: { type: String, required: true },
    symbol:        { type: String, required: true, uppercase: true },
    type:          { type: String, enum: ["buy","sell"], required: true },
    volume:        { type: Number, required: true },
    openPrice:     { type: Number, required: true },
    closePrice:    { type: Number, default: 0 },
    openTime:      { type: Date,   required: true },
    closeTime:     { type: Date },
    profit:        { type: Number, default: 0 },
    commission:    { type: Number, default: 0 },
    swap:          { type: Number, default: 0 },
    isOpen:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index for fast per-user date-range queries
TradeSchema.index({ userId: 1, openTime: -1 });
TradeSchema.index({ accountId: 1, openTime: -1 });

if (mongoose.models.Trade) delete mongoose.models.Trade;
const Trade: Model<ITrade> = mongoose.model<ITrade>("Trade", TradeSchema);
export default Trade;
