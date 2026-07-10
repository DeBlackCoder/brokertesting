import mongoose, { Document, Model, Schema } from "mongoose";

export type AccountStatus = "active" | "passed" | "failed" | "breached" | "inactive" | "funded";

export interface ITradingAccount extends Document {
  userId:       mongoose.Types.ObjectId;
  accountNumber:string;
  plan:         string;           // e.g. "$50k Evaluation · MetaTrader 5"
  platform:     string;           // MetaTrader 4 | MetaTrader 5 | cTrader
  status:       AccountStatus;
  phase:        string;           // Phase 1, Phase 2, Founded, Step 1 ...
  balance:      number;
  equity:       number;
  startBalance: number;           // initial funded balance
  profitTarget: number;           // absolute dollar target
  maxDailyLoss: number;
  maxOverallLoss:number;
  currentDrawdown:number;
  tradingDays:  number;
  minTradingDays:number;
  credentials?: { login: string; server: string; password?: string };
  isActive:     boolean;
  createdAt:    Date;
  updatedAt:    Date;
}

const TradingAccountSchema = new Schema<ITradingAccount>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    accountNumber: { type: String, required: true, unique: true, index: true },
    plan:          { type: String, required: true },
    platform:      { type: String, required: true, default: "MetaTrader 5" },
    status:        { type: String, enum: ["active","passed","failed","breached","inactive","funded"], default: "active" },
    phase:         { type: String, default: "Phase 1" },
    balance:       { type: Number, default: 0 },
    equity:        { type: Number, default: 0 },
    startBalance:  { type: Number, required: true },
    profitTarget:  { type: Number, required: true },
    maxDailyLoss:  { type: Number, required: true },
    maxOverallLoss:{ type: Number, required: true },
    currentDrawdown:{ type: Number, default: 0 },
    tradingDays:   { type: Number, default: 0 },
    minTradingDays:{ type: Number, default: 5 },
    credentials:   { login: String, server: String, password: { type: String, select: false } },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (mongoose.models.TradingAccount) delete mongoose.models.TradingAccount;
const TradingAccount: Model<ITradingAccount> = mongoose.model<ITradingAccount>("TradingAccount", TradingAccountSchema);
export default TradingAccount;
