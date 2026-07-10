import { withAuth, AuthedRequest } from "@/lib/withAuth";
import TradingAccount from "@/lib/models/TradingAccount";
import { ok, serverError } from "@/lib/apiResponse";

async function handler(req: AuthedRequest) {
  try {
    const accounts = await TradingAccount.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return ok(accounts);
  } catch (err) {
    return serverError(err);
  }
}

export const GET = withAuth(handler);
