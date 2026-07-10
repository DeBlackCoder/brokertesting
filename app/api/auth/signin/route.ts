import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signToken } from "@/lib/jwt";
import { badRequest, unauthorized, ok, serverError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return badRequest("email and password are required");
    }

    await connectDB();

    // Explicitly select passwordHash which has select:false on the schema
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+passwordHash");

    if (!user || !user.isActive) {
      // Same message for both cases — prevents user enumeration
      return unauthorized("Invalid email or password");
    }

    const valid = await user.comparePassword(password);
    if (!valid) return unauthorized("Invalid email or password");

    // Update last login timestamp (fire-and-forget, no await needed)
    user.lastLoginAt = new Date();
    user.save().catch(() => {});

    const token = signToken({
      userId:      String(user._id),
      email:       user.email,
      accountType: user.accountType,
      kycStatus:   user.kycStatus,
      role:        user.role,
    });

    return ok({
      token,
      user: {
        id:          user._id,
        email:       user.email,
        firstName:   user.firstName,
        lastName:    user.lastName,
        accountType: user.accountType,
        kycStatus:   user.kycStatus,
        role:        user.role,
        mfaEnabled:  user.mfaEnabled,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
