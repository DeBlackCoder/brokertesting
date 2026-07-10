import { withAuth, AuthedRequest } from "@/lib/withAuth";
import User from "@/lib/models/User";
import { ok, badRequest, unauthorized, serverError } from "@/lib/apiResponse";

async function patchHandler(req: AuthedRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return badRequest("currentPassword and newPassword are required");
    }
    if (newPassword.length < 8) {
      return badRequest("New password must be at least 8 characters");
    }

    // Re-fetch with passwordHash (select:false field)
    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!user) return unauthorized();

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return unauthorized("Current password is incorrect");

    // Setting passwordHash triggers the pre-save bcrypt hook
    user.passwordHash = newPassword;
    await user.save();

    return ok({ message: "Password updated successfully" });
  } catch (err) {
    return serverError(err);
  }
}

export const PATCH = withAuth(patchHandler);
