import mongoose, { Document, Model, Schema } from "mongoose";

export type UserBotStatus = "active" | "paused" | "expired";

export interface IUserBot extends Document {
  userId:      mongoose.Types.ObjectId;
  botId:       mongoose.Types.ObjectId;
  pricePaid:   number;
  status:      UserBotStatus;
  purchasedAt: Date;
  expiresAt?:  Date;         // null = lifetime licence
  createdAt:   Date;
}

const UserBotSchema = new Schema<IUserBot>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: "User",        required: true, index: true },
    botId:       { type: Schema.Types.ObjectId, ref: "TradingBot",  required: true },
    pricePaid:   { type: Number, required: true },
    status:      { type: String, enum: ["active","paused","expired"], default: "active" },
    purchasedAt: { type: Date, default: Date.now },
    expiresAt:   { type: Date },
  },
  { timestamps: true }
);

// One user can own the same bot multiple times (re-purchases), so no unique constraint.
UserBotSchema.index({ userId: 1, botId: 1 });

if (mongoose.models.UserBot) delete mongoose.models.UserBot;
const UserBot: Model<IUserBot> = mongoose.model<IUserBot>("UserBot", UserBotSchema);
export default UserBot;
