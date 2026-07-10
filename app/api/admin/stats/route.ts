import { withAuth, AuthedRequest } from "@/lib/withAuth";
import User from "@/lib/models/User";
import AccountApplication from "@/lib/models/AccountApplication";
import TradingAccount from "@/lib/models/TradingAccount";
import Trade from "@/lib/models/Trade";
import Payout from "@/lib/models/Payout";
import Wallet from "@/lib/models/Wallet";
import { ok, serverError } from "@/lib/apiResponse";

async function handler(_req: AuthedRequest) {
  try {
    const [
      totalUsers, verifiedUsers, pendingKyc, approvedKyc,
      totalApplications, pendingApplications,
      totalAccounts, activeAccounts,
      totalTrades, openTrades,
      pendingPayouts, totalPaidOut,
      walletAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ emailVerified: true }),
      User.countDocuments({ kycStatus: "pending" }),
      User.countDocuments({ kycStatus: "approved" }),
      AccountApplication.countDocuments(),
      AccountApplication.countDocuments({ status: { $in: ["submitted","under_review"] } }),
      TradingAccount.countDocuments(),
      TradingAccount.countDocuments({ status: "active" }),
      Trade.countDocuments(),
      Trade.countDocuments({ isOpen: true }),
      Payout.countDocuments({ status: { $in: ["pending","under_review"] } }),
      Payout.aggregate([{ $match:{ status:"paid" } },{ $group:{ _id:null, total:{ $sum:"$amount" } } }]).then(r => r[0]?.total ?? 0),
      Wallet.aggregate([{ $group:{ _id:null, live:{ $sum:"$liveBalance" }, demo:{ $sum:"$demoBalance" } } }]),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newUsers30d, appsByStatus, pendingDepositsAgg] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      AccountApplication.aggregate([{ $group:{ _id:"$status", count:{ $sum:1 } } }]),
      Wallet.aggregate([
        { $unwind: "$transactions" },
        { $match: { "transactions.type":"deposit", "transactions.status":"pending" } },
        { $group: { _id:null, count:{ $sum:1 }, total:{ $sum:"$transactions.amount" } } },
      ]),
    ]);

    return ok({
      users:        { total:totalUsers, verified:verifiedUsers, pendingKyc, approvedKyc, newLast30Days:newUsers30d },
      applications: { total:totalApplications, pending:pendingApplications, byStatus:appsByStatus },
      accounts:     { total:totalAccounts, active:activeAccounts },
      trades:       { total:totalTrades, open:openTrades },
      payouts:      { pending:pendingPayouts, totalPaidOut },
      wallets: {
        totalLive: walletAgg[0]?.live ?? 0,
        totalDemo: walletAgg[0]?.demo ?? 0,
        pendingDeposits:      pendingDepositsAgg[0]?.count ?? 0,
        pendingDepositsTotal: pendingDepositsAgg[0]?.total ?? 0,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}

export const GET = withAuth(handler, "admin");
