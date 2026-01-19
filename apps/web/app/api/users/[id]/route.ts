// apps/web/app/api/users/[id]/route.ts
// User detail endpoint - uses kernel pattern

import { kernel } from "@workspace/api-kernel";
import { userOutputSchema } from "@workspace/validation";

/**
 * GET /api/users/[id]
 *
 * Fetches a user by ID
 */
export const GET = kernel({
  method: "GET",
  routeId: "users.get",
  // Require authentication to view user details
  auth: { mode: "required" },
  output: userOutputSchema,

  async handler({ params }) {
    // Extract ID from route params
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    // TODO: Fetch from database
    // In production:
    // 1. Query user from database by ID
    // 2. Check permissions (can user view this profile?)
    // 3. Return user data

    // For now, return mock data
    return {
      id,
      name: `User ${id}`,
    };
  },
});
