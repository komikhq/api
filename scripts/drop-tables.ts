import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./db-utils.js";

async function dropAllTables() {
  const url = getDatabaseUrl();
  console.log("Connecting to PostgreSQL to drop all tables cleanly...");
  const sql = neon(url);

  try {
    await sql`DROP SCHEMA public CASCADE;`;
    await sql`CREATE SCHEMA public;`;
    await sql`GRANT ALL ON SCHEMA public TO public;`;
    console.log("✅ All PostgreSQL tables dropped and public schema recreated cleanly!");
  } catch (err: any) {
    console.error("Failed to drop tables:", err);
  }
}

dropAllTables();
