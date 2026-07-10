import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";
import { unauthorized } from "./apiResponse";
import { connectDB } from "./mongodb";
import User, { IUser, UserRole } from "./models/User";

export interface AuthedRequest extends NextRequest {
  user: IUser;
}

// Context type matches Next.js route handler signature exactly
type RouteContext = { params: Promise<Record<string, string>> };
type Handler = (req: AuthedRequest, ctx: RouteContext) => Promise<Response>;

/**
 * Wraps a route handler — validates Bearer JWT and attaches req.user.
 * Optionally enforces a minimum role.
 *
 * Returns a plain (req: NextRequest, ctx) handler so Next.js route
 * validators are satisfied — the cast inside is safe because we always
 * attach `user` before calling the inner handler.
 */
export function withAuth(handler: Handler, minRole?: UserRole) {
  return async (req: NextRequest, ctx: RouteContext): Promise<Response> => {
    const auth  = req.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) return unauthorized("No token provided");

    let payload: JWTPayload;
    try {
      payload = verifyToken(token);
    } catch {
      return unauthorized("Invalid or expired token");
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) return unauthorized("Account not found or inactive");

    if (minRole) {
      const RANKS: Record<UserRole, number> = { user: 0, admin: 1, super_admin: 2 };
      if (RANKS[user.role] < RANKS[minRole]) {
        return unauthorized("Insufficient permissions");
      }
    }

    // Attach user and call inner handler
    const authedReq  = req as AuthedRequest;
    authedReq.user   = user;
    return handler(authedReq, ctx);
  };
}
