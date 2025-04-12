import { type Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Get the connection string (try both environment variables)
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export default defineConfig({
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString!, // Use the connection pooler URL
  },
}) satisfies Config;
