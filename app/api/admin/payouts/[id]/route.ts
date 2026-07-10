import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Payout from "@/lib/models/Payout";
import Notification from "@/lib/models/Notification";
import Wallet from "@/lib/models/Wallet";
import { ok, badRequest, notFound, serverError } from "@/lib/apiResponse";
import mongoose from "mongoose";

async function patchHandler(req: AuthedRequest, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid payout ID");

    const { status, rejectionReason, note } = await req.json();
    const allowed = ["under_review", "paid", "rejected"];
    if (!allowed.includes(status)) return badRequest(`status must be one of: ${allowed.join(", ")}`);

    const payout = await Payout.findById(id);
    if (!payout) return notFound("Payout not found");

    payout.status     = status;
    payout.reviewedBy = req.user._id as mongoose.Types.ObjectId;
    payout.reviewedAt = new Date();
    if (status === "rejected" && rejectionReason) payout.rejectionReason = rejectionReason;
    if (status === "paid") payout.paidAt = new Date();
    await payout.save();

    // Notify user
    const notifTitle =
      status === "paid"        ? "Payout Processed ✓"    :
      status === "rejected"    ? "Payout Rejected"        :
                                 "Payout Under Review";
    const notifMsg =
      status === "paid"
        ? `Your payout of $${payout.amount.toLocaleString()} via ${payout.method} has been processed.`
        : status === "rejected"
          ? `Your payout request of $${payout.amount.toLocaleString()} was rejected. ${rejectionReason ?? ""}`
          : `Your payout request is now under review. We'll update you shortly.`;

    await Notification.create({
      userId:  payout.userId,
      type:    "payout",
      title:   notifTitle,
      message: notifMsg.trim(),
      link:    "payouts",
    });

    // If paid, debit user live wallet
    if (status === "paid") {
      const wallet = await Wallet.findOne({ userId: payout.userId });
      if (wallet && wallet.liveBalance >= payout.amount) {
        wallet.liveBalance -= payout.amount;
        wallet.transactions.push({
          type:      "withdrawal",
          amount:    payout.amount,
          status:    "confirmed",
          note:      note ?? `Payout via ${payout.method}`,
          createdBy: req.user._id as mongoose.Types.ObjectId,
          createdAt: new Date(),
        });
        await wallet.save();
      }
    }

    return ok({ message: `Payout marked as ${status}`, payout });
  } catch (err) {
    return serverError(err);
  }
}

export const PATCH = withAuth(patchHandler, "admin");
