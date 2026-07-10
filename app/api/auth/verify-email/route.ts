import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EmailVerificationToken from "@/lib/models/EmailVerificationToken";
import User from "@/lib/models/User";
import AccountApplication from "@/lib/models/AccountApplication";
import { hashOTP } from "@/lib/emailVerification";
import { signToken } from "@/lib/jwt";
import { badRequest, ok, serverError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) return badRequest("email and otp are required");
    if (!/^\d{5}$/.test(otp)) return badRequest("OTP must be a 5-digit number");

    await connectDB();

    const normalised = email.toLowerCase().trim();

    // Find the latest unused, non-expired token for this email
    const record = await EmailVerificationToken.findOne({
      email:     normalised,
      usedAt:    { $exists: false },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record) {
      return badRequest("Code has expired or doesn't exist. Please request a new one.");
    }

    // Max 5 attempts before lockout
    if (record.attempts >= 5) {
      await EmailVerificationToken.deleteOne({ _id: record._id });
      return badRequest("Too many incorrect attempts. Please request a new code.");
    }

    const inputHash = hashOTP(otp);
    if (inputHash !== record.otpHash) {
      record.attempts += 1;
      await record.save();
      const left = 5 - record.attempts;
      return badRequest(
        left > 0
          ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} remaining.`
          : "Too many incorrect attempts. Please request a new code."
      );
    }

    // Mark token used
    record.usedAt = new Date();
    await record.save();

    // Find or create user from application
    let user = await User.findOne({ email: normalised });

    if (!user) {
      const application = await AccountApplication.findOne({ email: normalised })
        .sort({ createdAt: -1 });

      user = await User.create({
        email:        normalised,
        passwordHash: crypto.randomUUID(), // placeholder — user sets password on first login
        firstName:    application?.firstName ?? "User",
        lastName:     application?.lastName  ?? "",
        accountType:  application?.accountType ?? "individual",
        kycStatus:    "under_review",
        isActive:     true,
      });

      if (application) {
        application.userId = user._id as typeof application.userId;
        application.status = "under_review";
        await application.save();
      }
    } else {
      user.isActive = true;
      if (user.kycStatus === "pending") user.kycStatus = "under_review";
      await user.save();
    }

    const token = signToken({
      userId:      String(user._id),
      email:       user.email,
      accountType: user.accountType,
      kycStatus:   user.kycStatus,
      role:        user.role,
    });

    return ok({
      verified: true,
      token,
      user: {
        id:          user._id,
        email:       user.email,
        firstName:   user.firstName,
        lastName:    user.lastName,
        accountType: user.accountType,
        kycStatus:   user.kycStatus,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
