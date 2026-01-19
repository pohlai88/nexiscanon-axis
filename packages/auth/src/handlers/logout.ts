/**
 * Logout handler - invalidates session.
 * Intended for use in Next.js API routes (server-side).
 */
export async function logoutHandler(token: string) {
  void token;
  // TODO: Implement logout
  // - Invalidate JWT token (blacklist or short TTL)
  // - Clear session
  return { success: true };
}
