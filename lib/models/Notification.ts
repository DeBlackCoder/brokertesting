import mongoose, { Document, Model, Schema } from "mongoose";

export type NotifType = "deposit" | "payout" | "trade" | "system" | "alert" | "kyc";

export interface INotification extends Document {
  userId:    mongoose.Types.ObjectId;
  type:      NotifType;
  title:     string;
  message:   string;
  read:      boolean;
  link?:     string;  // optional tab to navigate to
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:    { type: String, enum: ["deposit","payout","trade","system","alert","kyc"], required: true },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    read:    { type: Boolean, default: false, index: true },
    link:    { type: String },
  },
  { timestamps: true }
);

if (mongoose.models.Notification) delete mongoose.models.Notification;
const Notification: Model<INotification> = mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
