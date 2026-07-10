import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signToken } from "@/lib/jwt";
import {
  badRequest, conflict, created, serverError,
} from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email, password, firstName, lastName,
      phone, country, dateOfBirth, accountType,
    } = body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return badRequest("email, password, firstName and lastName are required");
    }
    if (password.length < 8) {
      return badRequest("Password must be at least 8 characters");
    }

    await connectDB();

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return conflict("An account with this email already exists");

    // Create user — passwordHash field holds the plain text here;
    // the pre-save hook hashes it before writing to MongoDB
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash: password,
      firstName,
      lastName,
      phone,
      country,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      accountType: accountType ?? "individual",
    });

    const token = signToken({
      userId: String(user._id),
      email: user.email,
      accountType: user.accountType,
      kycStatus: user.kycStatus,
    });

    return created({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountType: user.accountType,
        kycStatus: user.kycStatus,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
