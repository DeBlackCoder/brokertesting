import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import PasswordResetToken from "@/lib/models/PasswordResetToken";
import { hashOTP } from "@/lib/emailVerification";
import { signToken } from "@/lib/jwt";
import { badRequest, ok, serverError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return badRequest("email, otp and newPassword are required");
    }
    if (!/^\d{5}$/.test(otp)) {
      return badRequest("OTP must be a 5-digit number");
    }
    if (newPassword.length < 8) {
      return badRequest("Password must be at least 8 characters");
    }

    await connectDB();
    const normalised = email.toLowerCase().trim();

    // Find a valid, unused, non-expired token
    const record = await PasswordResetToken.findOne({
      email:     normalised,
      usedAt:    { $exists: false },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record) {
      return badRequest("Reset code has expired or doesn't exist. Please request a new one.");
    }

    if (record.attempts >= 5) {
      await PasswordResetToken.deleteOne({ _id: record._id });
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

    // Update password — pre-save hook will hash it
    const user = await User.findOne({ email: normalised }).select("+passwordHash");
    if (!user) return badRequest("Account not found.");

    user.passwordHash = newPassword; // will be hashed by pre-save hook
    await user.save();

    // Issue a fresh JWT so user is logged in immediately after reset
    const token = signToken({
      userId:      String(user._id),
      email:       user.email,
      accountType: user.accountType,
      kycStatus:   user.kycStatus,
      role:        user.role,
    });

    return ok({
      message: "Password reset successfully.",
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
