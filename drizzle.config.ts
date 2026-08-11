import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Uses Next's normal .env, .env.local, and environment-specific precedence.
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DIRECT_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Paste the Supabase Shared Pooler URI into .env.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Supabase's current Drizzle integration uses the Shared Pooler URI.
  dbCredentials: { url: databaseUrl },
});
