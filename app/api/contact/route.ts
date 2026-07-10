import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ContactMessage from "@/lib/models/ContactMessage";
import { badRequest, created, serverError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, subject, message, type } = body;

    if (!name || !email || !subject || !message) {
      return badRequest("name, email, subject and message are required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Invalid email address");
    }

    // Basic spam guard: reject messages shorter than 20 characters
    if (message.trim().length < 20) {
      return badRequest("Message must be at least 20 characters");
    }

    await connectDB();

    const contact = await ContactMessage.create({
      name:    name.trim(),
      email:   email.toLowerCase().trim(),
      company: company?.trim(),
      subject: subject.trim(),
      message: message.trim(),
      type:    type ?? "general",
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return created({
      id: contact._id,
      message: "Message received. We will respond within one business day.",
    });
  } catch (err) {
    return serverError(err);
  }
}
