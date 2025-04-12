import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../../db/schema";

// Get the connection string from environment variables
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("DATABASE_URL or POSTGRES_URL environment variable is not set");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString!, { prepare: false });

// Create a Drizzle ORM instance
export const db = drizzle(client, { schema });

// Export transaction function directly
export const transaction = db.transaction.bind(db);

// Export SQL tag for raw queries
export { sql };

// Re-export schema
export * from "../../db/schema";
