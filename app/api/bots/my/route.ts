import { withAuth, AuthedRequest } from "@/lib/withAuth";
import UserBot from "@/lib/models/UserBot";
import { ok, serverError } from "@/lib/apiResponse";

// GET — current user's owned bots
async function getHandler(req: AuthedRequest) {
  try {
    const bots = await UserBot.find({ userId: req.user._id })
      .populate("botId", "name description risk features returns badge")
      .sort({ purchasedAt: -1 })
      .lean();

    return ok(bots);
  } catch (err) {
    return serverError(err);
  }
}

// PATCH — pause/resume a bot
async function patchHandler(req: AuthedRequest) {
  try {
    const { userBotId, status } = await req.json();
    if (!["active","paused"].includes(status)) return ok({ error: "Invalid status" });

    const userBot = await UserBot.findOneAndUpdate(
      { _id: userBotId, userId: req.user._id },
      { $set: { status } },
      { new: true }
    );
    if (!userBot) return ok({ error: "Bot not found" });
    return ok({ message: `Bot ${status === "active" ? "resumed" : "paused"}`, status });
  } catch (err) {
    return serverError(err);
  }
}

export const GET   = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);
