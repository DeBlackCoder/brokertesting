import { withAuth, AuthedRequest } from "@/lib/withAuth";
import User from "@/lib/models/User";
import { ok, badRequest, notFound, forbidden, serverError } from "@/lib/apiResponse";
import mongoose from "mongoose";

async function patchHandler(req: AuthedRequest, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid user ID");

    const body = await req.json();
    const allowed: string[] = ["kycStatus", "isActive", "emailVerified", "firstName", "lastName", "phone", "country"];

    // Only super_admin can change roles
    if (body.role !== undefined) {
      if (req.user.role !== "super_admin") return forbidden("Only super_admin can change roles");
      // Prevent super_admin from demoting themselves
      if (id === String(req.user._id) && body.role !== "super_admin") {
        return forbidden("Cannot demote yourself");
      }
      allowed.push("role");
    }

    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true })
      .select("-passwordHash -mfaSecret");

    if (!user) return notFound("User not found");
    return ok(user);
  } catch (err) {
    return serverError(err);
  }
}

export const PATCH = withAuth(patchHandler, "admin");
