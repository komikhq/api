import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { createDbClient, users } from "@/db";
import { eq } from "drizzle-orm";
import { uploadToR2 } from "@/lib/storage";

export const userRoutes = new Hono<AppEnv>();

userRoutes.get("/profile", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const db = createDbClient(c.env.DATABASE_URL);
  const [profile] = await db.select().from(users).where(eq(users.id, user.userId));

  if (!profile) return c.json({ error: "User not found" }, 404);
  return c.json({ user: profile });
});

userRoutes.post("/avatar", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.parseBody();
  const file = body.file;

  if (!(file instanceof File)) {
    return c.json({ error: "No image file provided" }, 400);
  }

  const fileExt = file.name.split(".").pop() || "png";
  const objectKey = `avatars/${user.userId}-${Date.now()}.${fileExt}`;
  const buffer = await file.arrayBuffer();

  const publicUrl = await uploadToR2(
    c.env,
    "users",
    objectKey,
    buffer,
    { contentType: file.type || "image/png" }
  );

  const db = createDbClient(c.env.DATABASE_URL);
  await db
    .update(users)
    .set({ image: publicUrl, updatedAt: new Date() })
    .where(eq(users.id, user.userId));

  return c.json({ success: true, avatarUrl: publicUrl });
});
