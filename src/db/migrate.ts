import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "path";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Get the connection string (try both environment variables)
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("DATABASE_URL or POSTGRES_URL environment variable is not set");
  process.exit(1);
}

// Create a migration client with proper configuration for Supabase's connection pooler
const migrationClient = postgres(connectionString, {
  max: 1,
  prepare: false, // Disable prefetch as it is not supported for "Transaction" pool mode
});

// Run the migrations
const migrationsFolder = path.resolve(__dirname, "../../drizzle");
console.log(`Running migrations from ${migrationsFolder}...`);

async function runMigrations() {
  try {
    await migrate(drizzle(migrationClient), {
      migrationsFolder,
    });
    console.log("Migrations completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
