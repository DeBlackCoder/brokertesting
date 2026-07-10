import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPortfolioSnapshot extends Document {
  userId:    mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  date:      Date;       // midnight UTC — one doc per account per day
  balance:   number;
  equity:    number;
  dailyPnl:  number;
  createdAt: Date;
}

const PortfolioSnapshotSchema = new Schema<IPortfolioSnapshot>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User",          required: true },
    accountId: { type: Schema.Types.ObjectId, ref: "TradingAccount",required: true },
    date:      { type: Date, required: true },
    balance:   { type: Number, required: true },
    equity:    { type: Number, required: true },
    dailyPnl:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One snapshot per account per day
PortfolioSnapshotSchema.index({ accountId: 1, date: -1 }, { unique: true });
PortfolioSnapshotSchema.index({ userId: 1, date: -1 });

if (mongoose.models.PortfolioSnapshot) delete mongoose.models.PortfolioSnapshot;
const PortfolioSnapshot: Model<IPortfolioSnapshot> = mongoose.model<IPortfolioSnapshot>("PortfolioSnapshot", PortfolioSnapshotSchema);
export default PortfolioSnapshot;
