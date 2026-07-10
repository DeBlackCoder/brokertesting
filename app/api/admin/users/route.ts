import { withAuth, AuthedRequest } from "@/lib/withAuth";
import User from "@/lib/models/User";
import { ok, serverError } from "@/lib/apiResponse";

async function handler(req: AuthedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "25"));
    const search = searchParams.get("search") ?? "";
    const role   = searchParams.get("role") ?? "";
    const kyc    = searchParams.get("kyc") ?? "";

    const filter: Record<string, unknown> = {};
    if (search) filter.$or = [
      { email:     { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName:  { $regex: search, $options: "i" } },
    ];
    if (role) filter.role = role;
    if (kyc)  filter.kycStatus = kyc;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash -mfaSecret")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return ok({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    return serverError(err);
  }
}

// Minimum role: admin
export const GET = withAuth(handler, "admin");
