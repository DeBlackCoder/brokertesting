import { withAuth, AuthedRequest } from "@/lib/withAuth";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";
import { ok, badRequest, serverError } from "@/lib/apiResponse";

// POST — send a notification to all users (or filtered by role)
async function handler(req: AuthedRequest) {
  try {
    const { title, message, type = "system", targetRole = "" } = await req.json();
    if (!title?.trim())   return badRequest("title is required");
    if (!message?.trim()) return badRequest("message is required");

    const filter: Record<string, unknown> = {};
    if (targetRole && ["user","admin","super_admin"].includes(targetRole)) {
      filter.role = targetRole;
    }

    const users = await User.find(filter).select("_id").lean();
    if (!users.length) return badRequest("No users match the target");

    await Notification.insertMany(
      users.map(u => ({
        userId:  u._id,
        type,
        title:   title.trim(),
        message: message.trim(),
      }))
    );

    return ok({ sent: users.length, message: `Broadcast sent to ${users.length} user(s)` });
  } catch (err) {
    return serverError(err);
  }
}

export const POST = withAuth(handler, "admin");
