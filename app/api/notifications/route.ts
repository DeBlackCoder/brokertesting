import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Notification from "@/lib/models/Notification";
import { ok, serverError } from "@/lib/apiResponse";

// GET — latest 30 notifications for current user
async function getHandler(req: AuthedRequest) {
  try {
    const notifs = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unread = notifs.filter(n => !n.read).length;
    return ok({ notifications: notifs, unread });
  } catch (err) {
    return serverError(err);
  }
}

// POST — mark all as read
async function postHandler(req: AuthedRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, id } = body;

    if (action === "mark_all_read") {
      await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    } else if (action === "mark_read" && id) {
      await Notification.findOneAndUpdate({ _id: id, userId: req.user._id }, { $set: { read: true } });
    }

    return ok({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

export const GET  = withAuth(getHandler);
export const POST = withAuth(postHandler);
