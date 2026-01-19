// apps/web/app/api/auth/whoami/route.ts
// Test endpoint to verify JWT extraction (kernel-wrapped)

import { kernel } from "@workspace/api-kernel";
import { z } from "zod";

const Output = z.object({
  authenticated: z.boolean(),
  actorId: z.string().optional(),
  roles: z.array(z.string()),
  email: z.string().optional(),
});

export const GET = kernel({
  method: "GET",
  routeId: "auth.whoami",
  tenant: { required: false },
  auth: { mode: "optional" }, // Works with or without auth
  output: Output,

  async handler({ actorId, roles }) {
    return {
      authenticated: !!actorId,
      actorId,
      roles,
    };
  },
});
