import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AccountApplication from "@/lib/models/AccountApplication";
import EmailVerificationToken from "@/lib/models/EmailVerificationToken";
import { generateOTP, hashOTP } from "@/lib/emailVerification";
import { sendVerificationEmail, sendApplicationConfirmation } from "@/lib/mailer";
import { badRequest, created, serverError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      accountType, firstName, lastName, email, phone,
      country, dateOfBirth, dob, employmentStatus, annualIncome,
      netWorth, tradingExperience, sourceOfFunds,
    } = body;

    const birthDate = dateOfBirth ?? dob;

    if (!accountType || !firstName || !lastName || !email) {
      return badRequest("accountType, firstName, lastName and email are required");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Invalid email address");
    }

    await connectDB();

    const normalised = email.toLowerCase().trim();

    // Create application record
    const application = await AccountApplication.create({
      accountType,
      firstName:    firstName.trim(),
      lastName:     lastName.trim(),
      email:        normalised,
      phone,
      country,
      dateOfBirth:  birthDate,
      employmentStatus,
      annualIncome,
      netWorth,
      tradingExperience,
      sourceOfFunds,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    // Generate 5-digit OTP — 15 min expiry
    const otp       = generateOTP();
    const otpHash   = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate any previous unused OTPs for this email
    await EmailVerificationToken.deleteMany({ email: normalised, usedAt: { $exists: false } });

    await EmailVerificationToken.create({ email: normalised, otpHash, expiresAt });

    const accountTypeLabel =
      accountType === "individual"    ? "Individual" :
      accountType === "institutional" ? "Institutional" : "Corporate";

    // Fire emails in parallel — don't fail the request if email is slow
    await Promise.allSettled([
      sendVerificationEmail({ to: normalised, firstName: firstName.trim(), otp }),
      sendApplicationConfirmation({ to: normalised, firstName: firstName.trim(), accountType: accountTypeLabel }),
    ]);

    return created({
      applicationId: application._id,
      status:        application.status,
      message:       "Application submitted. A 5-digit verification code has been sent to your email.",
    });
  } catch (err) {
    return serverError(err);
  }
}
