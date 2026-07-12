import mongoose, { Document, Model, Schema } from "mongoose";

export type BotRisk   = "low" | "medium" | "high";
export type BotStatus = "active" | "inactive";

export interface ITradingBot extends Document {
  name:        string;
  description: string;
  price:       number;       // USD — set by admin
  monthlyFee?: number;       // optional recurring fee
  risk:        BotRisk;
  features:    string[];     // bullet point features
  returns:     string;       // e.g. "8–14% monthly"
  status:      BotStatus;
  badge?:      string;       // e.g. "Best Seller", "New"
  sortOrder:   number;
  createdAt:   Date;
  updatedAt:   Date;
}

const TradingBotSchema = new Schema<ITradingBot>(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    monthlyFee:  { type: Number, default: 0 },
    risk:        { type: String, enum: ["low","medium","high"], default: "medium" },
    features:    [{ type: String }],
    returns:     { type: String, default: "" },
    status:      { type: String, enum: ["active","inactive"], default: "active" },
    badge:       { type: String, default: "" },
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.TradingBot) delete mongoose.models.TradingBot;
const TradingBot: Model<ITradingBot> = mongoose.model<ITradingBot>("TradingBot", TradingBotSchema);
export default TradingBot;
