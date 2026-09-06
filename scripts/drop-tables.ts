import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
    if (fs.existsSync(devVarsPath)) {
      const content = fs.readFileSync(devVarsPath, "utf-8");
      const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) return match[1];
    }
  } catch (e) {}
  return "postgres://postgres:postgres@localhost:5432/komikhq";
}

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
