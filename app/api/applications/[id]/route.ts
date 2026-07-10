import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AccountApplication from "@/lib/models/AccountApplication";
import { ok, notFound, serverError, badRequest } from "@/lib/apiResponse";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return badRequest("Invalid application ID");
    }

    await connectDB();

    const application = await AccountApplication.findById(id).select(
      "accountType firstName lastName email status createdAt updatedAt"
    );

    if (!application) return notFound("Application not found");

    return ok({
      id:          application._id,
      accountType: application.accountType,
      firstName:   application.firstName,
      lastName:    application.lastName,
      email:       application.email,
      status:      application.status,
      submittedAt: application.createdAt,
      updatedAt:   application.updatedAt,
    });
  } catch (err) {
    return serverError(err);
  }
}
