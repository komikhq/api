import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./scripts/db-utils.js";

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
