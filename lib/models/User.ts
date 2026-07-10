import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "user" | "admin" | "super_admin";
export type KycStatus = "pending" | "under_review" | "approved" | "rejected";

export interface IUser extends Document {
  email:        string;
  passwordHash: string;
  firstName:    string;
  lastName:     string;
  phone?:       string;
  country?:     string;
  dateOfBirth?: Date;
  accountType:  "individual" | "institutional" | "corporate";
  role:         UserRole;
  kycStatus:    KycStatus;
  mfaEnabled:   boolean;
  mfaSecret?:   string;
  isActive:     boolean;
  emailVerified:boolean;
  lastLoginAt?: Date;
  createdAt:    Date;
  updatedAt:    Date;
  comparePassword(candidate: string): Promise<boolean>;
  fullName: string;
}

const UserSchema = new Schema<IUser>(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    firstName:    { type: String, required: true, trim: true },
    lastName:     { type: String, required: true, trim: true },
    phone:        { type: String, trim: true },
    country:      { type: String, trim: true },
    dateOfBirth:  { type: Date },
    accountType:  { type: String, enum: ["individual","institutional","corporate"], default: "individual" },
    role:         { type: String, enum: ["user","admin","super_admin"], default: "user", index: true },
    kycStatus:    { type: String, enum: ["pending","under_review","approved","rejected"], default: "pending" },
    mfaEnabled:   { type: Boolean, default: false },
    mfaSecret:    { type: String, select: false },
    isActive:     { type: Boolean, default: true },
    emailVerified:{ type: Boolean, default: false },
    lastLoginAt:  { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Prevent TS complaining about model cache in hot-reload
if (mongoose.models.User) delete mongoose.models.User;

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
