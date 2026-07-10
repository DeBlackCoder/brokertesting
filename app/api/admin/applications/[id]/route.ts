import { withAuth, AuthedRequest } from "@/lib/withAuth";
import AccountApplication from "@/lib/models/AccountApplication";
import User from "@/lib/models/User";
import { ok, badRequest, notFound, serverError } from "@/lib/apiResponse";
import mongoose from "mongoose";

async function patchHandler(req: AuthedRequest, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid application ID");

    const { status, reviewNotes } = await req.json();
    const allowed = ["submitted","under_review","approved","rejected","more_info_required"];
    if (!allowed.includes(status)) return badRequest(`status must be one of: ${allowed.join(", ")}`);

    const application = await AccountApplication.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          reviewNotes,
          reviewedBy:  String(req.user._id),
          reviewedAt:  new Date(),
        },
      },
      { new: true }
    );

    if (!application) return notFound("Application not found");

    // If approved → set user kycStatus to approved
    if (status === "approved" && application.userId) {
      await User.findByIdAndUpdate(application.userId, { $set: { kycStatus: "approved" } });
    }
    if (status === "rejected" && application.userId) {
      await User.findByIdAndUpdate(application.userId, { $set: { kycStatus: "rejected" } });
    }

    return ok(application);
  } catch (err) {
    return serverError(err);
  }
}

export const PATCH = withAuth(patchHandler, "admin");
