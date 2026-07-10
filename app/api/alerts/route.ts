import { withAuth, AuthedRequest } from "@/lib/withAuth";
import PriceAlert from "@/lib/models/PriceAlert";
import { ok, created, badRequest, serverError } from "@/lib/apiResponse";

// GET — all active alerts for current user
async function getHandler(req: AuthedRequest) {
  try {
    const alerts = await PriceAlert.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return ok(alerts);
  } catch (err) {
    return serverError(err);
  }
}

// POST — create a new price alert
async function postHandler(req: AuthedRequest) {
  try {
    const { symbol, base, price, direction, note } = await req.json();

    if (!symbol || !base)                             return badRequest("symbol and base are required");
    if (!price || isNaN(Number(price)) || price <= 0) return badRequest("price must be a positive number");
    if (!["above","below"].includes(direction))       return badRequest('direction must be "above" or "below"');

    const alert = await PriceAlert.create({
      userId:    req.user._id,
      symbol,
      base,
      price:     Number(price),
      direction,
      note:      note ?? "",
      status:    "active",
    });

    return created(alert);
  } catch (err) {
    return serverError(err);
  }
}

export const GET  = withAuth(getHandler);
export const POST = withAuth(postHandler);
