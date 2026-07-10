import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Notification from "@/lib/models/Notification";
import User from "@/lib/models/User";
import { ok, badRequest, notFound, serverError } from "@/lib/apiResponse";
import mongoose from "mongoose";

async function postHandler(req: AuthedRequest, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { userId } = await params;
    if (!mongoose.isValidObjectId(userId)) return badRequest("Invalid user ID");

    const { title, message, type = "system" } = await req.json();
    if (!title?.trim())   return badRequest("title is required");
    if (!message?.trim()) return badRequest("message is required");

    const user = await User.findById(userId).select("_id");
    if (!user) return notFound("User not found");

    await Notification.create({
      userId,
      type,
      title:   title.trim(),
      message: message.trim(),
    });

    return ok({ message: "Notification sent" });
  } catch (err) {
    return serverError(err);
  }
}

export const POST = withAuth(postHandler, "admin");
