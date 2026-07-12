import { withAuth, AuthedRequest } from "@/lib/withAuth";
import TradingBot from "@/lib/models/TradingBot";
import { ok, badRequest, notFound, serverError } from "@/lib/apiResponse";
import mongoose from "mongoose";

// PATCH — update bot (price, status, features, etc.)
async function patchHandler(req: AuthedRequest, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid bot ID");

    const body = await req.json();
    const allowed = ["name","description","price","monthlyFee","risk","features","returns","badge","sortOrder","status"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    if (update.price !== undefined) update.price = Number(update.price);

    const bot = await TradingBot.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    if (!bot) return notFound("Bot not found");
    return ok(bot);
  } catch (err) {
    return serverError(err);
  }
}

// DELETE — soft-delete (set inactive)
async function deleteHandler(_req: AuthedRequest, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid bot ID");
    const bot = await TradingBot.findByIdAndUpdate(id, { $set: { status: "inactive" } }, { new: true });
    if (!bot) return notFound("Bot not found");
    return ok({ message: "Bot deactivated" });
  } catch (err) {
    return serverError(err);
  }
}

export const PATCH  = withAuth(patchHandler,  "admin");
export const DELETE = withAuth(deleteHandler, "admin");
