import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./db-utils.js";

async function migrateToRelativeUrls() {
  const url = getDatabaseUrl();
  console.log("Connecting to Neon PostgreSQL to migrate stored URLs to relative keys...");
  const sql = neon(url);

  try {
    // 1. Comics: cover_url and banner_url
    const comicsRes = await sql`
      UPDATE comics
      SET cover_url = REGEXP_REPLACE(cover_url, '^https?://[^/]+/', ''),
          banner_url = REGEXP_REPLACE(banner_url, '^https?://[^/]+/', '')
      WHERE cover_url ~ '^https?://' OR banner_url ~ '^https?://'
      RETURNING id;
    `;
    console.log(`✅ Updated ${comicsRes.length} comics to relative URLs.`);

    // 2. Chapter pages: image_url
    const pagesRes = await sql`
      UPDATE chapter_pages
      SET image_url = REGEXP_REPLACE(image_url, '^https?://[^/]+/', '')
      WHERE image_url ~ '^https?://'
      RETURNING id;
    `;
    console.log(`✅ Updated ${pagesRes.length} chapter pages to relative URLs.`);

    // 3. User avatars: only internal R2 avatars (cdn-01 or avatars/)
    const usersRes = await sql`
      UPDATE "user"
      SET image = REGEXP_REPLACE(image, '^https?://[^/]+/', '')
      WHERE image LIKE '%cdn-01.komikhq.%' OR (image ~ '^https?://' AND image LIKE '%avatars/%')
      RETURNING id;
    `;
    console.log(`✅ Updated ${usersRes.length} user avatars to relative URLs.`);

    console.log("🎉 Migration completed successfully!");
  } catch (err: any) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateToRelativeUrls();
