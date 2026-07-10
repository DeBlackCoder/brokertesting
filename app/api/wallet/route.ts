import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Wallet from "@/lib/models/Wallet";
import Notification from "@/lib/models/Notification";
import { ok, badRequest, serverError } from "@/lib/apiResponse";

async function getHandler(req: AuthedRequest) {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) wallet = await Wallet.create({ userId: req.user._id });

    return ok({
      liveBalance:    wallet.liveBalance,
      demoBalance:    wallet.demoBalance,
      depositAddress: wallet.depositAddress,
      transactions:   wallet.transactions.slice(-20).reverse(),
    });
  } catch (err) {
    return serverError(err);
  }
}

// POST — user confirms they've sent a deposit (creates pending transaction + notification)
async function postHandler(req: AuthedRequest) {
  try {
    const { amount, txHash, note } = await req.json();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return badRequest("amount must be a positive number");
    }

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) wallet = await Wallet.create({ userId: req.user._id });

    const n = Number(amount);
    wallet.transactions.push({
      type:      "deposit",
      amount:    n,
      status:    "pending",
      note:      note ?? "User-submitted deposit awaiting admin confirmation",
      txHash:    txHash ?? undefined,
      createdAt: new Date(),
    } as import("@/lib/models/Wallet").IWalletTransaction);
    await wallet.save();

    // Create an in-app notification for the user
    await Notification.create({
      userId:  req.user._id,
      type:    "deposit",
      title:   "Deposit Submitted",
      message: `Your deposit of $${n.toLocaleString()} is pending review. We'll confirm within 1–24 hours.`,
      link:    "wallet",
    });

    return ok({ message: "Deposit submitted. Admin will confirm within 1–24 hours." });
  } catch (err) {
    return serverError(err);
  }
}

export const GET  = withAuth(getHandler);
export const POST = withAuth(postHandler);
