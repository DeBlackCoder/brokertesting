import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Trade from "@/lib/models/Trade";
import PortfolioSnapshot from "@/lib/models/PortfolioSnapshot";
import { ok, serverError } from "@/lib/apiResponse";

async function handler(req: AuthedRequest) {
  try {
    const userId = req.user._id;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") ?? "week";

    const now  = new Date();
    const from = new Date();
    if (period === "week")  from.setDate(now.getDate() - 7);
    if (period === "month") from.setMonth(now.getMonth() - 1);
    // "all" — no from filter

    const matchBase: Record<string, unknown> = { userId, isOpen: false };
    if (period !== "all") matchBase.closeTime = { $gte: from };

    const [agg] = await Trade.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id:          null,
          totalTrades:  { $sum: 1 },
          wins:         { $sum: { $cond: [{ $gt: ["$profit", 0] }, 1, 0] } },
          losses:       { $sum: { $cond: [{ $lte: ["$profit", 0] }, 1, 0] } },
          totalProfit:  { $sum: { $cond: [{ $gt: ["$profit", 0] }, "$profit", 0] } },
          totalLoss:    { $sum: { $cond: [{ $lte: ["$profit", 0] }, "$profit", 0] } },
          bestTrade:    { $max: "$profit" },
          worstTrade:   { $min: "$profit" },
          totalCommission: { $sum: "$commission" },
          longsWon:     { $sum: { $cond: [{ $and: [{ $eq: ["$type","buy"] }, { $gt: ["$profit", 0] }] }, 1, 0] } },
          longsTotal:   { $sum: { $cond: [{ $eq: ["$type","buy"] }, 1, 0] } },
          shortsWon:    { $sum: { $cond: [{ $and: [{ $eq: ["$type","sell"] }, { $gt: ["$profit", 0] }] }, 1, 0] } },
          shortsTotal:  { $sum: { $cond: [{ $eq: ["$type","sell"] }, 1, 0] } },
          totalVolume:  { $sum: "$volume" },
        },
      },
    ]);

    const winRate      = agg ? (agg.wins / agg.totalTrades) * 100 : 0;
    const profitFactor = agg && agg.totalLoss < 0 ? Math.abs(agg.totalProfit / agg.totalLoss) : 0;
    const avgWin       = agg && agg.wins > 0 ? agg.totalProfit / agg.wins : 0;
    const avgLoss      = agg && agg.losses > 0 ? Math.abs(agg.totalLoss / agg.losses) : 0;
    const expectancy   = agg ? (winRate/100) * avgWin - (1 - winRate/100) * avgLoss : 0;
    const avgRR        = avgLoss > 0 ? avgWin / avgLoss : 0;
    const tradesPerDay = period === "week" ? (agg?.totalTrades ?? 0) / 7
                       : period === "month" ? (agg?.totalTrades ?? 0) / 30
                       : null;

    // Daily PnL snapshots for chart
    const snapshots = await PortfolioSnapshot.find(
      period === "all" ? { userId } : { userId, date: { $gte: from } }
    ).sort({ date: 1 }).select("date dailyPnl balance equity").lean();

    return ok({
      stats: {
        totalTrades:   agg?.totalTrades  ?? 0,
        wins:          agg?.wins         ?? 0,
        losses:        agg?.losses       ?? 0,
        winRate:       +winRate.toFixed(1),
        profitFactor:  +profitFactor.toFixed(2),
        avgRR:         +avgRR.toFixed(2),
        avgWin:        +avgWin.toFixed(2),
        avgLoss:       +avgLoss.toFixed(2),
        bestTrade:     agg?.bestTrade    ?? 0,
        worstTrade:    agg?.worstTrade   ?? 0,
        expectancy:    +expectancy.toFixed(2),
        totalCommission: agg?.totalCommission ?? 0,
        longsWon:      agg?.longsWon     ?? 0,
        longsTotal:    agg?.longsTotal   ?? 0,
        shortsWon:     agg?.shortsWon    ?? 0,
        shortsTotal:   agg?.shortsTotal  ?? 0,
        totalVolume:   +(agg?.totalVolume ?? 0).toFixed(2),
        tradesPerDay:  tradesPerDay ? +tradesPerDay.toFixed(1) : null,
      },
      dailyPnl: snapshots.map(s => ({ date: s.date, pnl: s.dailyPnl, balance: s.balance })),
    });
  } catch (err) {
    return serverError(err);
  }
}

export const GET = withAuth(handler);
