import { withAuth, AuthedRequest } from "@/lib/withAuth";
import AccountApplication from "@/lib/models/AccountApplication";
import { ok, serverError } from "@/lib/apiResponse";

async function handler(req: AuthedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "25"));
    const status = searchParams.get("status") ?? "";
    const search = searchParams.get("search") ?? "";

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { email:     { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName:  { $regex: search, $options: "i" } },
    ];

    const [applications, total] = await Promise.all([
      AccountApplication.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "firstName lastName email role kycStatus")
        .lean(),
      AccountApplication.countDocuments(filter),
    ]);

    return ok({ applications, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    return serverError(err);
  }
}

export const GET = withAuth(handler, "admin");
