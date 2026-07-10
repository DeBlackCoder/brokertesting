import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Wallet from "@/lib/models/Wallet";
import Notification from "@/lib/models/Notification";
import User from "@/lib/models/User";
import { ok, badRequest, serverError } from "@/lib/apiResponse";
import mongoose from "mongoose";

// GET — all pending deposit transactions across all wallets
export const GET = withAuth(async (_req: AuthedRequest) => {
  try {
    // Aggregate pending deposit transactions from all wallets
    const wallets = await Wallet.find({
      "transactions.type": "deposit",
      "transactions.status": "pending",
    }).populate("userId", "email firstName lastName").lean();

    const deposits: unknown[] = [];
    for (const w of wallets) {
      const user = (w.userId as unknown) as { _id: string; email: string; firstName: string; lastName: string } | null;
      for (const tx of w.transactions) {
        if (tx.type === "deposit" && tx.status === "pending") {
          deposits.push({
            walletId:  w._id,
            userId:    user?._id ?? String(w.userId),
            userEmail: user?.email ?? "—",
            userName:  user ? `${user.firstName} ${user.lastName}` : "—",
            txId:      tx._id,
            amount:    tx.amount,
            txHash:    (tx as Record<string, unknown>).txHash ?? null,
            note:      tx.note ?? "",
            createdAt: tx.createdAt,
          });
        }
      }
    }

    // Sort newest first
    (deposits as Record<string, unknown>[]).sort((a, b) =>
      new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    );

    return ok(deposits);
  } catch (err) {
    return serverError(err);
  }
}, "admin");

// PATCH — confirm or reject a pending deposit
export const PATCH = withAuth(async (req: AuthedRequest) => {
  try {
    const { walletId, txId, action, note } = await req.json();
    if (!walletId || !txId)                           return badRequest("walletId and txId are required");
    if (!["confirm","reject"].includes(action))        return badRequest('action must be "confirm" or "reject"');
    if (!mongoose.isValidObjectId(walletId))           return badRequest("Invalid walletId");

    const wallet = await Wallet.findById(walletId);
    if (!wallet) return badRequest("Wallet not found");

    const txList = wallet.transactions as unknown as Array<typeof wallet.transactions[0] & { id?: never }>;
    const tx = txList.find(t => String(t._id) === String(txId));
    if (!tx) return badRequest("Transaction not found");
    if (tx.status !== "pending") return badRequest("Transaction is no longer pending");

    if (action === "confirm") {
      tx.status = "confirmed";
      wallet.liveBalance += tx.amount;
      await wallet.save();

      await Notification.create({
        userId:  wallet.userId,
        type:    "deposit",
        title:   "Deposit Confirmed ✓",
        message: `Your deposit of $${tx.amount.toLocaleString()} has been confirmed and credited to your live wallet.`,
        link:    "wallet",
      });
    } else {
      tx.status = "rejected";
      tx.note   = note ?? "Deposit rejected by admin";
      await wallet.save();

      await Notification.create({
        userId:  wallet.userId,
        type:    "deposit",
        title:   "Deposit Rejected",
        message: `Your deposit of $${tx.amount.toLocaleString()} was not confirmed. ${note ?? "Please contact support."}`,
        link:    "wallet",
      });
    }

    return ok({ message: `Deposit ${action === "confirm" ? "confirmed" : "rejected"}`, balance: wallet.liveBalance });
  } catch (err) {
    return serverError(err);
  }
}, "admin");
