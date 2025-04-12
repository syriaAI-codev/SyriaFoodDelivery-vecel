import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./shared/schema";

// Set up the connection string from the environment variable
const connectionString = process.env.DATABASE_URL!;

// Database client for migrations
const migrationClient = postgres(connectionString, { max: 1 });

// Schema migration function
async function migrateDatabase() {
  try {
    console.log("Starting database migration...");
    
    // Initialize drizzle with migration client
    const db = drizzle(migrationClient, { schema });
    
    // Run migrations
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the connection
    await migrationClient.end();
  }
}

// Run the migration
migrateDatabase();