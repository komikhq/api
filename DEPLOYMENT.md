# Cloudflare Workers Deployment Guide (`komikhq-api`)

This document outlines the deployment workflow for the Hono API backend (`komikhq-api`) to Cloudflare Workers, environment variable & secret management (Build-time vs Runtime Secrets), and preventing dashboard variable overwrites.

---

## 1. Environment Variables & Secrets Setup

### A. Non-Sensitive Variables (Public / System Vars)
Public environment variables or basic configurations can be set via the Cloudflare Dashboard GUI or defined inside `wrangler.jsonc`.

> [!IMPORTANT]
> **Preventing Dashboard Variable Overwrites (`keep_vars = true`)**
> The `wrangler.jsonc` file in this project is configured with `"keep_vars": true`. This flag ensures that environment variables added or modified manually via the **Cloudflare Dashboard (Settings > Variables and Secrets)** will **NOT be deleted or overwritten** when you run `wrangler deploy`.

### B. Sensitive Secrets (Runtime Secrets)
Secret variables (such as Database Connection URL, Auth Secret, API Keys) **MUST NEVER** be stored in plaintext inside `wrangler.jsonc`. Add them via Wrangler CLI or Dashboard Secrets:

Run via terminal to store secrets securely in Cloudflare Workers:
```bash
# Database URL (Neon PostgreSQL)
npx wrangler secret put DATABASE_URL

# Better Auth Secret Key
npx wrangler secret put BETTER_AUTH_SECRET

# Better Auth URL (Production Domain)
npx wrangler secret put BETTER_AUTH_URL

# Google OAuth Credentials
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET

# Email Provider Key (Resend / Brevo)
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put BREVO_API_KEY

# Pusher Realtime Credentials
npx wrangler secret put PUSHER_APP_ID
npx wrangler secret put PUSHER_KEY
npx wrangler secret put PUSHER_SECRET
npx wrangler secret put PUSHER_CLUSTER
```

---

## 2. Build & Deployment Commands

### Step 1: Type Checking & Typegen
Ensure Cloudflare Workers bindings are correctly generated and check for TypeScript errors:
```bash
pnpm run cf-typegen
pnpm exec tsc --noEmit
```

### Step 2: Deploy to Cloudflare Workers
Run the deployment command using `pnpm` or `wrangler`:
```bash
pnpm run deploy
# Or directly:
npx wrangler deploy
```

---

## 3. Custom Domain & Routing Configuration

This project is configured in `wrangler.jsonc` to deploy to:
- **Workers Dev Domain**: `workers_dev: true` (e.g., `komikhq-api.<your-subdomain>.workers.dev`)
- **Custom Domain**: `api.komikhq.com`

---

## 4. Troubleshooting & Maintenance

- **Inspect Live Production Logs**:
  ```bash
  npx wrangler tail
  ```
- **Ensure Cloudflare KV & R2 Bindings Are Attached**:
  - KV Namespace: `KV_KOMIKHQ`
  - R2 Buckets: `USERS_BUCKET`, `MEDIA_BUCKET`
