import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import NewsletterSubscriber from "@/lib/models/NewsletterSubscriber";
import { badRequest, created, conflict, serverError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source } = body;

    if (!email) return badRequest("email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Invalid email address");
    }

    await connectDB();

    const existing = await NewsletterSubscriber.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existing) {
      // Re-subscribe if they previously unsubscribed
      if (!existing.isActive) {
        existing.isActive = true;
        existing.unsubscribedAt = undefined;
        await existing.save();
        return created({ message: "You have been re-subscribed." });
      }
      return conflict("This email is already subscribed.");
    }

    await NewsletterSubscriber.create({
      email: email.toLowerCase().trim(),
      source: source ?? "homepage",
    });

    return created({ message: "Successfully subscribed." });
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return badRequest("email is required");

    await connectDB();

    const sub = await NewsletterSubscriber.findOne({
      email: email.toLowerCase().trim(),
    });
    if (!sub) return badRequest("Email not found");

    sub.isActive = false;
    sub.unsubscribedAt = new Date();
    await sub.save();

    return created({ message: "Successfully unsubscribed." });
  } catch (err) {
    return serverError(err);
  }
}
