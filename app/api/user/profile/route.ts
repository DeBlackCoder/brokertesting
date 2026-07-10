import { withAuth, AuthedRequest } from "@/lib/withAuth";
import User from "@/lib/models/User";
import { ok, badRequest, serverError } from "@/lib/apiResponse";

// GET — return current user profile
async function getHandler(req: AuthedRequest) {
  try {
    const u = req.user;
    return ok({
      firstName:   u.firstName,
      lastName:    u.lastName,
      email:       u.email,
      phone:       u.phone ?? "",
      country:     u.country ?? "",
      accountType: u.accountType,
      role:        u.role,
      kycStatus:   u.kycStatus,
      mfaEnabled:  u.mfaEnabled,
      createdAt:   u.createdAt,
    });
  } catch (err) {
    return serverError(err);
  }
}

// PATCH — update profile fields
async function patchHandler(req: AuthedRequest) {
  try {
    const body = await req.json();
    const allowed = ["firstName", "lastName", "phone", "country"];
    const update: Record<string, string> = {};

    for (const key of allowed) {
      if (body[key] !== undefined) {
        const val = String(body[key]).trim();
        if (!val) return badRequest(`${key} cannot be empty`);
        update[key] = val;
      }
    }

    if (!Object.keys(update).length) return badRequest("No valid fields to update");

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    );

    return ok({
      firstName: user!.firstName,
      lastName:  user!.lastName,
      phone:     user!.phone ?? "",
      country:   user!.country ?? "",
    });
  } catch (err) {
    return serverError(err);
  }
}

export const GET   = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);
