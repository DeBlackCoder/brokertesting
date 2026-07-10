import crypto from "crypto";

/**
 * Generate a cryptographically random 5-digit OTP.
 */
export function generateOTP(): string {
  // Use random bytes to avoid modulo bias
  const buf = crypto.randomBytes(3);
  const num = ((buf[0] << 16) | (buf[1] << 8) | buf[2]) % 100000;
  return String(num).padStart(5, "0");
}

/**
 * Hash an OTP for DB storage — never store raw codes.
 */
export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
