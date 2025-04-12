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

// Query to get column details for a specific table
const COLUMNS_QUERY = `
  SELECT 
    column_name, 
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
  FROM 
    information_schema.columns
  WHERE 
    table_schema = $1
    AND table_name = $2
  ORDER BY 
    ordinal_position
`;

// Function to inspect a table structure
async function inspectTable(schema, table) {
  try {
    console.log(`Inspecting ${schema}.${table} structure...`);

    // Get column details
    const columns = await client.unsafe(COLUMNS_QUERY, [schema, table]);

    console.log(`\n=== ${schema}.${table} COLUMNS ===`);
    console.log("Column Name | Data Type | Max Length | Default | Nullable");
    console.log("-----------|-----------|------------|---------|----------");

    columns.forEach((col) => {
      const maxLength = col.character_maximum_length
        ? col.character_maximum_length
        : "n/a";
      const defaultVal = col.column_default ? col.column_default : "n/a";
      const nullable = col.is_nullable === "YES" ? "YES" : "NO";

      console.log(
        `${col.column_name.padEnd(11)} | ${col.data_type.padEnd(9)} | ${String(
          maxLength
        ).padEnd(10)} | ${String(defaultVal)
          .substring(0, 7)
          .padEnd(7)} | ${nullable}`
      );
    });

    // Close the connection
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("Error inspecting table:", error);
    process.exit(1);
  }
}

// Specify which table to inspect
inspectTable("auth", "users");
