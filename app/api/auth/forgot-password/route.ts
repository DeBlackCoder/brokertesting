import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import PasswordResetToken from "@/lib/models/PasswordResetToken";
import { generateOTP, hashOTP } from "@/lib/emailVerification";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { badRequest, ok, serverError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Valid email address is required");
    }

    await connectDB();
    const normalised = email.toLowerCase().trim();

    // Rate-limit: 1 request per 60 seconds
    const recent = await PasswordResetToken.findOne({
      email:     normalised,
      usedAt:    { $exists: false },
      createdAt: { $gt: new Date(Date.now() - 60_000) },
    });
    if (recent) return badRequest("Please wait 60 seconds before requesting another code.");

    // Don't reveal whether the email exists (security best practice)
    const user = await User.findOne({ email: normalised }).select("firstName email");

    if (user) {
      // Invalidate any previous unused codes
      await PasswordResetToken.deleteMany({ email: normalised, usedAt: { $exists: false } });

      const otp       = generateOTP();
      const otpHash   = hashOTP(otp);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await PasswordResetToken.create({ email: normalised, otpHash, expiresAt });
      await sendPasswordResetEmail({ to: normalised, firstName: user.firstName, otp });
    }

    // Always return the same message — prevents email enumeration
    return ok({ message: "If an account exists with that email, a reset code has been sent." });
  } catch (err) {
    return serverError(err);
  }
}
