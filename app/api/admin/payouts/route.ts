import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Payout from "@/lib/models/Payout";
import { ok, serverError } from "@/lib/apiResponse";

async function handler(req: AuthedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "";
    const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "25"));

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [payouts, total] = await Promise.all([
      Payout.find(filter)
        .populate("userId", "email firstName lastName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Payout.countDocuments(filter),
    ]);

    const totalPending = await Payout.aggregate([
      { $match: { status: { $in: ["pending", "under_review"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then(r => r[0]?.total ?? 0);

    const totalPaid = await Payout.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then(r => r[0]?.total ?? 0);

    return ok({ payouts, total, page, pages: Math.ceil(total / limit), totalPending, totalPaid });
  } catch (err) {
    return serverError(err);
  }
}

export const GET = withAuth(handler, "admin");
