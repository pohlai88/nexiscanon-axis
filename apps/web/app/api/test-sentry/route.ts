import { kernel } from "@workspace/api-kernel";
import { z } from "zod";

const Output = z.object({ message: z.string() });

export const GET = kernel({
  method: "GET",
  routeId: "test.sentry",
  tenant: { required: false },
  auth: { mode: "public" },
  output: Output,
  async handler() {
    // Intentionally throw error to test Sentry/GlitchTip
    throw new Error("Test error for GlitchTip verification");
  },
});
