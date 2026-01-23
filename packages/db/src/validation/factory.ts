/**
 * Zod v4 Schema Factory for drizzle-zod.
 *
 * Uses createSchemaFactory with coercion enabled for:
 * - Date fields: Coerce string/number → Date objects
 *
 * Pattern (Zod v4 best practices):
 * - Insert schemas: Use coercion (API input → DB)
 * - Select schemas: Strict types (DB → API, already typed by Drizzle)
 *
 * @see https://orm.drizzle.team/docs/zod.html
 */

import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

/**
 * Schema factory with date coercion enabled.
 * Use for input validation (API → DB).
 */
export const {
  createInsertSchema: createCoercedInsertSchema,
  createSelectSchema: createCoercedSelectSchema,
  createUpdateSchema: createCoercedUpdateSchema,
} = createSchemaFactory({
  coerce: {
    date: true, // Coerce date strings → Date objects
  },
});

/**
 * Re-export standard schema creators for strict validation.
 * Use when coercion is not needed.
 */
export { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

/**
 * Re-export Zod for convenience.
 */
export { z };
