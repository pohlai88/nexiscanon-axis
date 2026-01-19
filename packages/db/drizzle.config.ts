// packages/db/drizzle.config.ts
// Drizzle Kit configuration

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // dbCredentials only needed for db:migrate, not db:generate
  ...(process.env.DATABASE_URL && {
    dbCredentials: {
      url: process.env.DATABASE_URL,
    },
  }),
});
