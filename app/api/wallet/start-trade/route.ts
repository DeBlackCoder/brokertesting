import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Wallet from "@/lib/models/Wallet";
import TradingSession from "@/lib/models/TradingSession";
import { badRequest, created, serverError } from "@/lib/apiResponse";

export const POST = withAuth(async (req: AuthedRequest) => {
  try {
    const { type } = await req.json();
    if (type !== "demo" && type !== "live") {
      return badRequest('type must be "demo" or "live"');
    }

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) wallet = await Wallet.create({ userId: req.user._id });

    if (type === "live" && wallet.liveBalance <= 0) {
      return badRequest("Insufficient live balance. Please fund your wallet first.");
    }

    const startBalance = type === "live" ? wallet.liveBalance : wallet.demoBalance;

    // Check for existing active session of same type
    const existing = await TradingSession.findOne({
      userId: req.user._id,
      type,
      status: "active",
    });
    if (existing) {
      return badRequest(`You already have an active ${type} trading session.`);
    }

    const session = await TradingSession.create({
      userId:         req.user._id,
      type,
      status:         "active",
      startBalance,
      currentBalance: startBalance,
      openedAt:       new Date(),
    });

    return created({ session });
  } catch (err) {
    return serverError(err);
  }
});
