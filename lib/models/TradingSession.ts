import mongoose, { Document, Model, Schema } from "mongoose";

export type SessionType   = "demo" | "live";
export type SessionStatus = "active" | "closed" | "stopped";

export interface ITradingSession extends Document {
  userId:       mongoose.Types.ObjectId;
  type:         SessionType;
  status:       SessionStatus;
  startBalance: number;
  currentBalance: number;
  totalPnl:     number;
  totalTrades:  number;
  openedAt:     Date;
  closedAt?:    Date;
  notes?:       string;
  createdAt:    Date;
  updatedAt:    Date;
}

const TradingSessionSchema = new Schema<ITradingSession>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:           { type: String, enum: ["demo","live"], required: true },
    status:         { type: String, enum: ["active","closed","stopped"], default: "active" },
    startBalance:   { type: Number, required: true },
    currentBalance: { type: Number, required: true },
    totalPnl:       { type: Number, default: 0 },
    totalTrades:    { type: Number, default: 0 },
    openedAt:       { type: Date, default: Date.now },
    closedAt:       { type: Date },
    notes:          { type: String },
  },
  { timestamps: true }
);

TradingSessionSchema.index({ userId: 1, status: 1 });

if (mongoose.models.TradingSession) delete mongoose.models.TradingSession;
const TradingSession: Model<ITradingSession> =
  mongoose.model<ITradingSession>("TradingSession", TradingSessionSchema);
export default TradingSession;
