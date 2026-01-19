import { otpSchema } from "@workspace/validation";

/**
 * Email verification handler - validates OTP code.
 * Intended for use in Next.js API routes (server-side).
 */
export async function verifyEmailHandler(input: unknown) {
  const validated = otpSchema.parse(input);
  void validated;

  // TODO: Implement email verification
  // - Look up verification code
  // - Check if expired
  // - Mark email as verified
  // - Return session
  throw new Error(
    "verifyEmailHandler not implemented - add database integration"
  );
}
