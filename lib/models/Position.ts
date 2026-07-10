import mongoose, { Document, Model, Schema } from "mongoose";

export type PositionSide   = "buy" | "sell";
export type PositionStatus = "open" | "closed" | "sl_hit" | "tp_hit";

export interface IPosition extends Document {
  userId:       mongoose.Types.ObjectId;
  sessionId:    mongoose.Types.ObjectId;
  sessionType:  "demo" | "live";
  symbol:       string;          // e.g. BTC/USD
  side:         PositionSide;
  lotSize:      number;          // units / contract size
  entryPrice:   number;
  exitPrice?:   number;
  stopLoss?:    number;
  takeProfit?:  number;
  pnl:          number;
  status:       PositionStatus;
  openedAt:     Date;
  closedAt?:    Date;
  createdAt:    Date;
  updatedAt:    Date;
}

const PositionSchema = new Schema<IPosition>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: "User",           required: true, index: true },
    sessionId:   { type: Schema.Types.ObjectId, ref: "TradingSession", required: true, index: true },
    sessionType: { type: String, enum: ["demo","live"], required: true },
    symbol:      { type: String, required: true, uppercase: true },
    side:        { type: String, enum: ["buy","sell"], required: true },
    lotSize:     { type: Number, required: true, min: 0.01 },
    entryPrice:  { type: Number, required: true },
    exitPrice:   { type: Number },
    stopLoss:    { type: Number },
    takeProfit:  { type: Number },
    pnl:         { type: Number, default: 0 },
    status:      { type: String, enum: ["open","closed","sl_hit","tp_hit"], default: "open" },
    openedAt:    { type: Date, default: Date.now },
    closedAt:    { type: Date },
  },
  { timestamps: true }
);

PositionSchema.index({ userId: 1, status: 1 });
PositionSchema.index({ sessionId: 1, status: 1 });

if (mongoose.models.Position) delete mongoose.models.Position;
const Position: Model<IPosition> = mongoose.model<IPosition>("Position", PositionSchema);
export default Position;
