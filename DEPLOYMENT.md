# Cloudflare Workers Deployment Guide (`komikhq-api`)

This document outlines the deployment workflow for the Hono API backend (`komikhq-api`) to Cloudflare Workers using the **Cloudflare Dashboard (UI Web)** & **GitHub Integration**, table-based Environment Variable & Secret management, and resource binding configuration (KV & R2).

---

## 1. Setup Deployment via Cloudflare Dashboard (GitHub Integration)

When importing the `komikhq-api` repository for the first time via **Cloudflare Dashboard > Workers & Pages > Create > Import from Git**:

| Dashboard Form Field | Value / Input | Description |
| --- | --- | --- |
| **Project Name** | `komikhq-api` | Worker project name in Cloudflare Dashboard. |
| **Production Branch** | `main` | Primary branch triggering auto-deployments. |
| **Build Command** | *(Leave Blank)* or `npm run deploy` | If left blank, Cloudflare automatically parses `wrangler.jsonc`. |
| **Build Output Directory** | *(Leave Blank)* | Not required for standalone Hono Workers. |
| **Root Directory** | `/` (or leave blank if at repo root) | Path to the API project directory in the GitHub repository. |

---

## 2. Environment Variables & Secrets Configuration

In Cloudflare Workers, **Runtime Variables & Secrets** are values accessed by the Hono application when processing live HTTP requests.

> [!NOTE]
> **Dashboard Location**:
> Navigate to Worker `komikhq-api` > **Settings** > **Variables and secrets**.

### Runtime Variables & Secrets Table

| Variable Name | Dashboard Type | Category | Description / Example Value |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Encrypt (Secret)** | Sensitive | Neon PostgreSQL connection string (`postgresql://...`) |
| `BETTER_AUTH_SECRET` | **Encrypt (Secret)** | Sensitive | Random secret key for Better Auth encryption |
| `BETTER_AUTH_URL` | **Plaintext (Variable)** | Public | Public API Backend domain (e.g., `https://api.komikhq.com`) |
| `GOOGLE_CLIENT_ID` | **Plaintext (Variable)** | Public | Google Cloud Console OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | **Encrypt (Secret)** | Sensitive | Google Cloud Console OAuth Client Secret |
| `RESEND_API_KEY` | **Encrypt (Secret)** | Sensitive | Resend email service API key |
| `BREVO_API_KEY` | **Encrypt (Secret)** | Sensitive | Brevo email service API key |
| `PUSHER_APP_ID` | **Plaintext (Variable)** | Public | Pusher Channels App ID |
| `PUSHER_KEY` | **Plaintext (Variable)** | Public | Pusher Channels App Key |
| `PUSHER_SECRET` | **Encrypt (Secret)** | Sensitive | Pusher Channels App Secret |
| `PUSHER_CLUSTER` | **Plaintext (Variable)** | Public | Pusher Channels Cluster (e.g., `ap1`) |

> [!IMPORTANT]
> **Preventing Dashboard Overwrites (`keep_vars = true`)**
> The `wrangler.jsonc` file in this project is configured with `"keep_vars": true`. This ensures environment variables and secrets manually added or updated via the **Cloudflare Dashboard** are **NOT deleted or overwritten** when running CLI deployments (`npx wrangler deploy`).

---

## 3. Storage & Resource Bindings (KV & R2)

This application uses Cloudflare KV and R2 Storage. Binding names are specified in `wrangler.jsonc` or verified via **Settings > Bindings**:

| Variable Binding Name | Resource Type | Cloudflare Target Resource |
| --- | --- | --- |
| `KV_KOMIKHQ` | **KV Namespace** | KV Namespace `KV_KOMIKHQ` |
| `USERS_BUCKET` | **R2 Bucket** | R2 Bucket `komikhq-users` |
| `MEDIA_BUCKET` | **R2 Bucket** | R2 Bucket `komikhq-media` |

---

## 4. Custom Domain & Route Setup

To attach a custom domain to this API Worker:
1. Go to Worker `komikhq-api` > **Settings** > **Domains & Routes**.
2. Click **Add > Custom Domain**.
3. Enter `api.komikhq.com` (ensure the DNS zone `komikhq.com` is active under the same Cloudflare account).

---

## 5. Inspection & Maintenance

- **Live Stream Logs (Realtime Logs)**:
  Open Worker `komikhq-api` > **Observability** tab > **Logs**, or run via terminal:
  ```bash
  npx wrangler tail
  ```
