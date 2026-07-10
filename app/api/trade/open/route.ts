import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Position from "@/lib/models/Position";
import TradingSession from "@/lib/models/TradingSession";
import Wallet from "@/lib/models/Wallet";
import { badRequest, created, serverError } from "@/lib/apiResponse";

export const POST = withAuth(async (req: AuthedRequest) => {
  try {
    const { sessionId, symbol, side, lotSize, entryPrice, stopLoss, takeProfit } = await req.json();

    if (!sessionId || !symbol || !side || !lotSize || !entryPrice) {
      return badRequest("sessionId, symbol, side, lotSize and entryPrice are required");
    }
    if (!["buy","sell"].includes(side)) return badRequest('side must be "buy" or "sell"');
    if (lotSize <= 0) return badRequest("lotSize must be positive");

    const session = await TradingSession.findOne({ _id: sessionId, userId: req.user._id, status: "active" });
    if (!session) return badRequest("Active trading session not found");

    // Cost = lotSize * entryPrice
    const cost = lotSize * entryPrice;

    if (session.type === "live") {
      const wallet = await Wallet.findOne({ userId: req.user._id });
      if (!wallet || wallet.liveBalance < cost) {
        return badRequest(`Insufficient live balance. Need $${cost.toFixed(2)}, have $${wallet?.liveBalance.toFixed(2) ?? 0}`);
      }
      wallet.liveBalance -= cost;
      wallet.transactions.push({ type:"debit", amount: cost, status:"confirmed", note:`Open ${side.toUpperCase()} ${symbol} × ${lotSize}`, createdAt: new Date() });
      await wallet.save();
    } else {
      const wallet = await Wallet.findOne({ userId: req.user._id });
      if (!wallet || wallet.demoBalance < cost) {
        return badRequest(`Insufficient demo balance. Need $${cost.toFixed(2)}, have $${wallet?.demoBalance.toFixed(2) ?? 0}`);
      }
      wallet.demoBalance -= cost;
      await wallet.save();
    }

    const position = await Position.create({
      userId:      req.user._id,
      sessionId:   session._id,
      sessionType: session.type,
      symbol:      symbol.toUpperCase(),
      side,
      lotSize:     Number(lotSize),
      entryPrice:  Number(entryPrice),
      stopLoss:    stopLoss  ? Number(stopLoss)  : undefined,
      takeProfit:  takeProfit ? Number(takeProfit) : undefined,
      status:      "open",
      openedAt:    new Date(),
    });

    session.totalTrades += 1;
    await session.save();

    return created({ position });
  } catch (err) {
    return serverError(err);
  }
});
