import { withAuth, AuthedRequest } from "@/lib/withAuth";
import TradingBot from "@/lib/models/TradingBot";
import { ok, badRequest, serverError, created } from "@/lib/apiResponse";

// GET — all bots (admin view, includes inactive)
async function getHandler(_req: AuthedRequest) {
  try {
    const bots = await TradingBot.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    return ok(bots);
  } catch (err) {
    return serverError(err);
  }
}

// POST — create a new bot plan
async function postHandler(req: AuthedRequest) {
  try {
    const { name, description, price, monthlyFee, risk, features, returns, badge, sortOrder } = await req.json();
    if (!name?.trim())           return badRequest("name is required");
    if (!description?.trim())    return badRequest("description is required");
    if (price == null || isNaN(Number(price)) || Number(price) < 0) return badRequest("valid price is required");

    const bot = await TradingBot.create({
      name:       name.trim(),
      description:description.trim(),
      price:      Number(price),
      monthlyFee: Number(monthlyFee ?? 0),
      risk:       risk ?? "medium",
      features:   Array.isArray(features) ? features : [],
      returns:    returns ?? "",
      badge:      badge ?? "",
      sortOrder:  Number(sortOrder ?? 0),
      status:     "active",
    });

    return created(bot);
  } catch (err) {
    return serverError(err);
  }
}

export const GET  = withAuth(getHandler, "admin");
export const POST = withAuth(postHandler, "admin");
