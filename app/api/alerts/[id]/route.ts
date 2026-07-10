import { withAuth, AuthedRequest } from "@/lib/withAuth";
import PriceAlert from "@/lib/models/PriceAlert";
import { ok, badRequest, notFound, serverError } from "@/lib/apiResponse";
import mongoose from "mongoose";

// DELETE — cancel an alert
async function deleteHandler(req: AuthedRequest, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid alert ID");

    const alert = await PriceAlert.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!alert) return notFound("Alert not found");
    return ok({ message: "Alert cancelled" });
  } catch (err) {
    return serverError(err);
  }
}

export const DELETE = withAuth(deleteHandler);
