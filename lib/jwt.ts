import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

if (!SECRET) throw new Error("JWT_SECRET is not set in environment variables");

export interface JWTPayload {
  userId:      string;
  email:       string;
  accountType: string;
  kycStatus:   string;
  role?:       string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, SECRET) as JWTPayload;
}
