import mongoose, { Document, Model, Schema } from "mongoose";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  type: "consultation" | "support" | "institutional" | "general";
  status: "new" | "read" | "replied" | "closed";
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, lowercase: true, trim: true },
    company: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["consultation", "support", "institutional", "general"],
      default: "general",
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "closed"],
      default: "new",
    },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ??
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessage;
