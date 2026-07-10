import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EmailVerificationToken from "@/lib/models/EmailVerificationToken";
import AccountApplication from "@/lib/models/AccountApplication";
import { generateOTP, hashOTP } from "@/lib/emailVerification";
import { sendVerificationEmail } from "@/lib/mailer";
import { badRequest, ok, serverError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Valid email address is required");
    }

    await connectDB();

    const normalised = email.toLowerCase().trim();

    // Rate-limit: one resend per 60 seconds
    const recent = await EmailVerificationToken.findOne({
      email:     normalised,
      usedAt:    { $exists: false },
      createdAt: { $gt: new Date(Date.now() - 60_000) },
    });

    if (recent) {
      return badRequest("Please wait 60 seconds before requesting another code.");
    }

    // Invalidate previous unused codes
    await EmailVerificationToken.deleteMany({ email: normalised, usedAt: { $exists: false } });

    const otp       = generateOTP();
    const otpHash   = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await EmailVerificationToken.create({ email: normalised, otpHash, expiresAt });

    const application = await AccountApplication.findOne({ email: normalised })
      .sort({ createdAt: -1 });
    const firstName = application?.firstName ?? "there";

    await sendVerificationEmail({ to: normalised, firstName, otp });

    return ok({ message: "A new verification code has been sent." });
  } catch (err) {
    return serverError(err);
  }
}
