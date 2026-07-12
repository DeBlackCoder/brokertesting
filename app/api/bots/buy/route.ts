import { withAuth, AuthedRequest } from "@/lib/withAuth";
import TradingBot from "@/lib/models/TradingBot";
import UserBot    from "@/lib/models/UserBot";
import Wallet     from "@/lib/models/Wallet";
import Notification from "@/lib/models/Notification";
import { ok, badRequest, notFound, serverError } from "@/lib/apiResponse";
import mongoose from "mongoose";

async function postHandler(req: AuthedRequest) {
  try {
    const { botId } = await req.json();
    if (!botId || !mongoose.isValidObjectId(botId)) return badRequest("Invalid bot ID");

    const bot = await TradingBot.findOne({ _id: botId, status: "active" });
    if (!bot) return notFound("Bot not found or unavailable");

    // Check user's live wallet balance
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) wallet = await Wallet.create({ userId: req.user._id });

    if (wallet.liveBalance < bot.price) {
      return badRequest(`Insufficient balance. Bot costs $${bot.price.toLocaleString()}. Your balance: $${wallet.liveBalance.toLocaleString()}`);
    }

    // Check if already owned and active
    const existing = await UserBot.findOne({ userId: req.user._id, botId, status: "active" });
    if (existing) return badRequest("You already own this bot");

    // Deduct from wallet
    wallet.liveBalance -= bot.price;
    wallet.transactions.push({
      type:      "debit",
      amount:    bot.price,
      status:    "confirmed",
      note:      `Purchased trading bot: ${bot.name}`,
      createdAt: new Date(),
    } as import("@/lib/models/Wallet").IWalletTransaction);
    await wallet.save();

    // Create user bot record
    const userBot = await UserBot.create({
      userId:      req.user._id,
      botId:       bot._id,
      pricePaid:   bot.price,
      status:      "active",
      purchasedAt: new Date(),
    });

    // Notify user
    await Notification.create({
      userId:  req.user._id,
      type:    "system",
      title:   `🤖 ${bot.name} Activated!`,
      message: `Your trading bot "${bot.name}" is now active. It will automatically trade on your behalf.`,
      link:    "bots",
    });

    return ok({
      message:     `${bot.name} purchased successfully`,
      userBotId:   userBot._id,
      liveBalance: wallet.liveBalance,
    });
  } catch (err) {
    return serverError(err);
  }
}

export const POST = withAuth(postHandler);
