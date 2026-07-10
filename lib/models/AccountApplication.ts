import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAccountApplication extends Document {
  // Account type
  accountType: "individual" | "institutional" | "corporate";

  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  dateOfBirth: string;

  // Financial profile
  employmentStatus: string;
  annualIncome: string;
  netWorth: string;
  tradingExperience: string;
  sourceOfFunds: string;

  // Documents (stored as filenames / cloud URLs)
  documents: {
    photoId?: string;
    proofOfAddress?: string;
    proofOfFunds?: string;
  };

  // Review
  status: "submitted" | "under_review" | "approved" | "rejected" | "more_info_required";
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;

  // Link to user once account is created
  userId?: mongoose.Types.ObjectId;

  // Meta
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountApplicationSchema = new Schema<IAccountApplication>(
  {
    accountType: {
      type: String,
      enum: ["individual", "institutional", "corporate"],
      required: true,
    },
    firstName:    { type: String, required: true, trim: true },
    lastName:     { type: String, required: true, trim: true },
    email:        { type: String, required: true, lowercase: true, trim: true, index: true },
    phone:        { type: String, trim: true },
    country:      { type: String, trim: true },
    dateOfBirth:  { type: String },
    employmentStatus:  { type: String },
    annualIncome:      { type: String },
    netWorth:          { type: String },
    tradingExperience: { type: String },
    sourceOfFunds:     { type: String },
    documents: {
      photoId:        { type: String },
      proofOfAddress: { type: String },
      proofOfFunds:   { type: String },
    },
    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "rejected", "more_info_required"],
      default: "submitted",
    },
    reviewNotes: { type: String },
    reviewedBy:  { type: String },
    reviewedAt:  { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const AccountApplication: Model<IAccountApplication> =
  mongoose.models.AccountApplication ??
  mongoose.model<IAccountApplication>("AccountApplication", AccountApplicationSchema);

export default AccountApplication;
