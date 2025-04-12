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

// Query to list all tables and schemas
const TABLES_QUERY = `
  SELECT 
    table_schema,
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_schema = t.table_schema AND table_name = t.table_name) as column_count
  FROM 
    information_schema.tables t
  WHERE 
    table_schema NOT IN ('pg_catalog', 'information_schema')
    AND table_type = 'BASE TABLE'
  ORDER BY 
    table_schema, 
    table_name
`;

// Query to list all schemas
const SCHEMAS_QUERY = `
  SELECT 
    schema_name
  FROM 
    information_schema.schemata
  WHERE 
    schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  ORDER BY 
    schema_name
`;

// List all tables in the database
async function listTables() {
  try {
    console.log("Connecting to database...");

    // Get schemas
    console.log("\n=== DATABASE SCHEMAS ===");
    const schemas = await client.unsafe(SCHEMAS_QUERY);
    schemas.forEach((schema) => {
      console.log(`- ${schema.schema_name}`);
    });

    // Get tables
    console.log("\n=== DATABASE TABLES ===");
    const tables = await client.unsafe(TABLES_QUERY);

    if (tables.length === 0) {
      console.log("No tables found.");
    } else {
      let currentSchema = "";

      tables.forEach((table) => {
        if (currentSchema !== table.table_schema) {
          currentSchema = table.table_schema;
          console.log(`\nSchema: ${currentSchema}`);
        }

        console.log(`  - ${table.table_name} (${table.column_count} columns)`);
      });
    }

    // Close the connection
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("Error listing tables:", error);
    process.exit(1);
  }
}

listTables();
