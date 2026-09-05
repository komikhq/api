import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { createDbClient, users, accounts } from "@/db";
import { eq, and, isNotNull } from "drizzle-orm";
import { uploadToR2 } from "@/lib/storage";
import { getAuth } from "@/lib/auth";

export const userRoutes = new Hono<AppEnv>();

userRoutes.get("/profile", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const db = createDbClient(c.env.DATABASE_URL);
  const [profile] = await db.select().from(users).where(eq(users.id, user.userId));

  if (!profile) return c.json({ error: "User not found" }, 404);

  const [credAccount] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, user.userId),
        eq(accounts.providerId, "credential"),
        isNotNull(accounts.password)
      )
    );

  return c.json({
    user: profile,
    hasPassword: Boolean(credAccount),
  });
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

userRoutes.delete("/profile", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const db = createDbClient(c.env.DATABASE_URL);
  let body: { password?: string; email?: string } = {};
  try {
    body = await c.req.json();
  } catch (e) {}

  const [credAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, user.userId),
        eq(accounts.providerId, "credential"),
        isNotNull(accounts.password)
      )
    );

  const hasPassword = Boolean(credAccount);

  if (hasPassword) {
    if (!body.password) {
      return c.json({ error: "Kata sandi konfirmasi wajib diisi." }, 400);
    }

    try {
      const auth = getAuth(c.env as any);
      const isValid = await auth.api.verifyPassword({
        body: {
          password: body.password,
        },
        headers: c.req.raw.headers,
      });

      if (!isValid) {
        return c.json({ error: "Kata sandi konfirmasi tidak sesuai." }, 400);
      }
    } catch (e) {
      return c.json({ error: "Kata sandi yang Anda masukkan tidak valid." }, 400);
    }
  } else {
    if (!body.email || body.email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      return c.json({ error: "Alamat email konfirmasi tidak sesuai." }, 400);
    }
  }

  await db.delete(users).where(eq(users.id, user.userId));

  return c.json({ success: true, message: "Akun berhasil dihapus permanen." });
});
