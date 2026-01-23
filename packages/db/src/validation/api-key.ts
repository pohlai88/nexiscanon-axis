import {
  createCoercedInsertSchema,
  createSelectSchema,
  z,
} from "./factory";
import { apiKeys } from "../schema/api-key";

/**
 * API key insert schema.
 * Uses coerced schema for date fields (Zod v4 best practice).
 */
export const insertApiKeySchema = createCoercedInsertSchema(apiKeys, {
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
});

/**
 * API key select schema.
 */
export const selectApiKeySchema = createSelectSchema(apiKeys);

/**
 * Create API key form schema.
 */
export const createApiKeyFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less")
    .trim(),
});

// Type exports
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type SelectApiKey = z.infer<typeof selectApiKeySchema>;
export type CreateApiKeyForm = z.infer<typeof createApiKeyFormSchema>;
