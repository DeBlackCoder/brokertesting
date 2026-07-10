import mongoose, { Document, Model, Schema } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  source: string; // which page/section the signup came from
  isActive: boolean;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    source:   { type: String, default: "homepage" },
    isActive: { type: Boolean, default: true },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true }
);

const NewsletterSubscriber: Model<INewsletterSubscriber> =
  mongoose.models.NewsletterSubscriber ??
  mongoose.model<INewsletterSubscriber>("NewsletterSubscriber", NewsletterSubscriberSchema);

export default NewsletterSubscriber;
