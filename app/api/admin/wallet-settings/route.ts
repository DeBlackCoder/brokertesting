import { withAuth, AuthedRequest } from "@/lib/withAuth";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { ok, serverError, badRequest } from "@/lib/apiResponse";

// Simple settings stored in a dedicated collection
const settingsSchema = new mongoose.Schema({ key: String, value: String }, { timestamps: true });
const Settings = mongoose.models.Settings ?? mongoose.model("Settings", settingsSchema);

export const GET = withAuth(async (_req: AuthedRequest) => {
  try {
    await connectDB();
    const doc = await Settings.findOne({ key: "deposit_address" });
    return ok({ depositAddress: doc?.value ?? "" });
  } catch (err) {
    return serverError(err);
  }
}, "admin");

export const PATCH = withAuth(async (req: AuthedRequest) => {
  try {
    const { depositAddress } = await req.json();
    if (!depositAddress || typeof depositAddress !== "string") {
      return badRequest("depositAddress is required");
    }
    await connectDB();
    await Settings.findOneAndUpdate(
      { key: "deposit_address" },
      { value: depositAddress.trim() },
      { upsert: true, new: true }
    );
    return ok({ depositAddress: depositAddress.trim() });
  } catch (err) {
    return serverError(err);
  }
}, "admin");
