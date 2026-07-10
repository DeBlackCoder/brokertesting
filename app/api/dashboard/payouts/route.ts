import { NextRequest } from "next/server";
import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Payout from "@/lib/models/Payout";
import TradingAccount from "@/lib/models/TradingAccount";
import { ok, created, badRequest, serverError } from "@/lib/apiResponse";

async function getHandler(req: AuthedRequest) {
  try {
    const payouts = await Payout.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("accountId", "accountNumber plan")
      .lean();

    const totalPaid    = payouts.filter(p => p.status === "paid").reduce((s,p) => s + p.amount, 0);
    const totalPending = payouts.filter(p => p.status === "pending" || p.status === "under_review").reduce((s,p) => s + p.amount, 0);

    return ok({ payouts, totalPaid, totalPending });
  } catch (err) {
    return serverError(err);
  }
}

async function postHandler(req: AuthedRequest) {
  try {
    const { accountId, amount, method, methodDetails } = await req.json();
    if (!amount || !method) return badRequest("amount and method are required");
    if (amount <= 0)         return badRequest("amount must be positive");

    const account = accountId
      ? await TradingAccount.findOne({ _id: accountId, userId: req.user._id })
      : null;

    const payout = await Payout.create({
      userId:        req.user._id,
      accountId:     account?._id,
      accountNumber: account?.accountNumber,
      amount,
      method,
      methodDetails,
      status: "pending",
    });

    return created({ payout });
  } catch (err) {
    return serverError(err);
  }
}

export const GET  = withAuth(getHandler);
export const POST = withAuth(postHandler);
