import fs from "node:fs";
import path from "node:path";

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
  if (fs.existsSync(devVarsPath)) {
    const content = fs.readFileSync(devVarsPath, "utf-8");
    const hasDatabaseUrl = /^\s*DATABASE_URL\s*=/m.test(content);
    if (hasDatabaseUrl) {
      const match = content.match(/^\s*DATABASE_URL\s*=\s*(.*?)\s*$/m);
      const databaseUrl = match?.[1].replace(/^["']|["']$/g, "").trim();
      if (!databaseUrl) {
        throw new Error("DATABASE_URL in .dev.vars must be set before database commands.");
      }
      return databaseUrl;
    }
  }

  return "postgres://postgres:postgres@localhost:5432/komikhq";
}
