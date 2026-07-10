import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Position from "@/lib/models/Position";
import TradingSession from "@/lib/models/TradingSession";
import Wallet from "@/lib/models/Wallet";
import { badRequest, ok, notFound, serverError } from "@/lib/apiResponse";
import mongoose from "mongoose";

export const POST = withAuth(async (req: AuthedRequest, { params }) => {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid position ID");

    const { exitPrice, reason } = await req.json();
    if (!exitPrice || isNaN(Number(exitPrice))) return badRequest("exitPrice is required");

    const position = await Position.findOne({ _id: id, userId: req.user._id, status: "open" });
    if (!position) return notFound("Open position not found");

    const exit = Number(exitPrice);

    // PnL calculation:
    // BUY:  profit = (exitPrice - entryPrice) * lotSize
    // SELL: profit = (entryPrice - exitPrice) * lotSize
    const pnl = position.side === "buy"
      ? (exit - position.entryPrice) * position.lotSize
      : (position.entryPrice - exit) * position.lotSize;

    const status = reason === "sl_hit" ? "sl_hit" : reason === "tp_hit" ? "tp_hit" : "closed";

    position.exitPrice = exit;
    position.pnl       = pnl;
    position.status    = status;
    position.closedAt  = new Date();
    await position.save();

    // Return funds + PnL to wallet
    const returnAmount = position.lotSize * position.entryPrice + pnl;
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (wallet) {
      const isLive = position.sessionType === "live";
      if (isLive) {
        wallet.liveBalance += returnAmount;
        wallet.transactions.push({
          type:   pnl >= 0 ? "credit" : "debit",
          amount: Math.abs(pnl),
          status: "confirmed",
          note:   `Close ${position.side.toUpperCase()} ${position.symbol} PnL: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`,
          createdAt: new Date(),
        });
      } else {
        wallet.demoBalance += returnAmount;
      }
      await wallet.save();
    }

    // Update session PnL
    const session = await TradingSession.findById(position.sessionId);
    if (session) {
      session.totalPnl      += pnl;
      session.currentBalance = (session.currentBalance ?? session.startBalance) + pnl;
      await session.save();
    }

    return ok({ position, pnl });
  } catch (err) {
    return serverError(err);
  }
});
