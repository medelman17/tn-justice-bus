const dotenv = require("dotenv");
const postgres = require("postgres");

// Load environment variables
dotenv.config({ path: ".env.local" });

// Get the connection string from environment variables
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("DATABASE_URL or POSTGRES_URL environment variable is not set");
  process.exit(1);
}

// Create a client with the configuration for Supabase's connection pooler
const client = postgres(connectionString, { prepare: false });

// Test the connection by executing a simple query
async function testConnection() {
  try {
    console.log("Testing database connection...");

    // Execute a simple query to test the connection
    const result = await client`SELECT version();`;

    console.log("\nConnection successful! ✅");
    console.log("Database version:", result[0].version);

    // Close the connection
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("\nConnection failed! ❌");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
