import { withAuth, AuthedRequest } from "@/lib/withAuth";
import TradingSession from "@/lib/models/TradingSession";
import { ok, serverError } from "@/lib/apiResponse";

export const GET = withAuth(async (req: AuthedRequest) => {
  try {
    const sessions = await TradingSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return ok(sessions);
  } catch (err) {
    return serverError(err);
  }
});
