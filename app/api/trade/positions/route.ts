import { withAuth, AuthedRequest } from "@/lib/withAuth";
import Position from "@/lib/models/Position";
import { ok, serverError } from "@/lib/apiResponse";

export const GET = withAuth(async (req: AuthedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const status    = searchParams.get("status") ?? "open";

    const filter: Record<string, unknown> = { userId: req.user._id };
    if (sessionId) filter.sessionId = sessionId;
    if (status !== "all") filter.status = status;

    const positions = await Position.find(filter)
      .sort({ openedAt: -1 })
      .limit(50)
      .lean();

    return ok(positions);
  } catch (err) {
    return serverError(err);
  }
});
