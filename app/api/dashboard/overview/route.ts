import { NextRequest } from "next/server";
import { withAuth, AuthedRequest } from "@/lib/withAuth";
import TradingAccount from "@/lib/models/TradingAccount";
import Trade from "@/lib/models/Trade";
import PortfolioSnapshot from "@/lib/models/PortfolioSnapshot";
import { ok, serverError } from "@/lib/apiResponse";

async function handler(req: AuthedRequest) {
  try {
    const userId = req.user._id;

    // All accounts for this user
    const accounts = await TradingAccount.find({ userId, isActive: true }).lean();

    // Aggregate totals across all accounts
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const totalEquity  = accounts.reduce((s, a) => s + a.equity, 0);

    // Today's PnL — sum of closed trades today
    const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
    const todayPnl   = await Trade.aggregate([
      { $match: { userId, isOpen: false, closeTime: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: "$profit" } } },
    ]);
    const dailyPnl = todayPnl[0]?.total ?? 0;

    // Max drawdown across all accounts
    const maxDrawdown = accounts.reduce((m, a) => Math.max(m, a.currentDrawdown), 0);

    // Open positions count
    const openPositions = await Trade.countDocuments({ userId, isOpen: true });

    // Equity curve — last 14 daily snapshots (most recent first)
    const snapshots = await PortfolioSnapshot.find({ userId })
      .sort({ date: -1 })
      .limit(14)
      .select("date balance equity dailyPnl")
      .lean();
    const equityCurve = snapshots.reverse().map(s => ({
      date:     s.date,
      balance:  s.balance,
      equity:   s.equity,
      dailyPnl: s.dailyPnl,
    }));

    // Recent trades (last 10 closed)
    const recentTrades = await Trade.find({ userId, isOpen: false })
      .sort({ closeTime: -1 })
      .limit(10)
      .select("symbol type volume openPrice closePrice closeTime profit accountNumber")
      .lean();

    return ok({
      summary: { totalBalance, totalEquity, dailyPnl, maxDrawdown, openPositions },
      equityCurve,
      recentTrades,
      accountCount: accounts.length,
    });
  } catch (err) {
    return serverError(err);
  }
}

export const GET = withAuth(handler);
