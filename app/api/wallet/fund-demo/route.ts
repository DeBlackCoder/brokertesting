import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Wallet from "@/lib/models/Wallet";
import { badRequest, ok, serverError } from "@/lib/apiResponse";

// Users can top up their demo balance freely (no real money)
export const POST = withAuth(async (req: AuthedRequest) => {
  try {
    const { amount } = await req.json();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return badRequest("amount must be a positive number");
    }
    // No upper limit — demo funds are virtual

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) wallet = await Wallet.create({ userId: req.user._id });

    wallet.demoBalance += Number(amount);
    wallet.transactions.push({
      type:   "demo_topup",
      amount: Number(amount),
      status: "confirmed",
      note:   "Demo balance top-up",
      createdAt: new Date(),
    });
    await wallet.save();

    return ok({ demoBalance: wallet.demoBalance, message: `$${Number(amount).toLocaleString()} added to demo wallet.` });
  } catch (err) {
    return serverError(err);
  }
});
