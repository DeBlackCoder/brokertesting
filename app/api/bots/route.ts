import { withAuth, AuthedRequest } from "@/lib/withAuth";
import TradingBot from "@/lib/models/TradingBot";
import UserBot    from "@/lib/models/UserBot";
import { ok, serverError } from "@/lib/apiResponse";

// GET — list all active bots + whether current user owns each
async function getHandler(req: AuthedRequest) {
  try {
    const bots = await TradingBot.find({ status: "active" }).sort({ sortOrder: 1, createdAt: 1 }).lean();

    // Find which bots this user already owns
    const owned = await UserBot.find({ userId: req.user._id, status: { $ne: "expired" } })
      .select("botId status purchasedAt")
      .lean();

    const ownedMap = new Map(owned.map(o => [String(o.botId), o]));

    const result = bots.map(b => ({
      ...b,
      owned:       ownedMap.has(String(b._id)),
      ownerStatus: ownedMap.get(String(b._id))?.status ?? null,
      purchasedAt: ownedMap.get(String(b._id))?.purchasedAt ?? null,
    }));

    return ok(result);
  } catch (err) {
    return serverError(err);
  }
}

export const GET = withAuth(getHandler);
