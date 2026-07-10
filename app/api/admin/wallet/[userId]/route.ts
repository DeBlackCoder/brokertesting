import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Wallet from "@/lib/models/Wallet";
import Notification from "@/lib/models/Notification";
import { ok, badRequest, serverError } from "@/lib/apiResponse";
import mongoose from "mongoose";

// GET — view a user's wallet
export const GET = withAuth(async (_req: AuthedRequest, { params }) => {
  try {
    const { userId } = await params;
    if (!mongoose.isValidObjectId(userId)) return badRequest("Invalid user ID");

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId });

    return ok({
      liveBalance:    wallet.liveBalance,
      demoBalance:    wallet.demoBalance,
      depositAddress: wallet.depositAddress,
      transactions:   wallet.transactions.slice(-50).reverse(),
    });
  } catch (err) {
    return serverError(err);
  }
}, "admin");

// PATCH — admin credits, debits, or adds a trading bonus to a user's live wallet
export const PATCH = withAuth(async (req: AuthedRequest, { params }) => {
  try {
    const { userId } = await params;
    if (!mongoose.isValidObjectId(userId)) return badRequest("Invalid user ID");

    const { action, amount, note } = await req.json();
    const allowed = ["credit", "debit", "bonus"];
    if (!allowed.includes(action)) return badRequest('action must be "credit", "debit", or "bonus"');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return badRequest("amount must be positive");

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId });

    const n = Number(amount);

    if (action === "debit" && wallet.liveBalance < n) {
      return badRequest("Insufficient balance to debit");
    }

    // bonus and credit both add to liveBalance; debit subtracts
    const delta = action === "debit" ? -n : n;
    wallet.liveBalance += delta;

    const txNote =
      action === "bonus"  ? (note?.trim() || "Trading bonus awarded") :
      action === "credit" ? (note?.trim() || "Admin credit")          :
                            (note?.trim() || "Admin debit");

    wallet.transactions.push({
      type:      action as "credit" | "debit" | "bonus",
      amount:    n,
      status:    "confirmed",
      note:      txNote,
      createdBy: req.user._id as mongoose.Types.ObjectId,
      createdAt: new Date(),
    });
    await wallet.save();

    // In-app notification for the user
    const notifTitle =
      action === "bonus"  ? "Trading Bonus Received 🎉" :
      action === "credit" ? "Funds Credited"             :
                            "Account Debited";

    const notifMsg =
      action === "bonus"
        ? `You received a trading bonus of $${n.toLocaleString()}. ${txNote !== "Trading bonus awarded" ? txNote : ""}`
        : action === "credit"
          ? `$${n.toLocaleString()} has been credited to your live wallet.`
          : `$${n.toLocaleString()} has been debited from your live wallet.`;

    await Notification.create({
      userId:  wallet.userId,
      type:    action === "bonus" ? "system" : "deposit",
      title:   notifTitle,
      message: notifMsg.trim(),
      link:    "wallet",
    });

    return ok({
      liveBalance: wallet.liveBalance,
      message:     `${action === "bonus" ? "Bonus added" : action === "credit" ? "Credited" : "Debited"}: $${n.toLocaleString()}`,
    });
  } catch (err) {
    return serverError(err);
  }
}, "admin");
