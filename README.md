<div align="center">

# KomikHQ API

**The services that power discovery, accounts, and comic reading on KomikHQ.**

[![Organization](https://img.shields.io/badge/Organization-KomikHQ-0D1117?style=for-the-badge&logo=github&logoColor=white)](https://github.com/komikhq)
[![Runtime](https://img.shields.io/badge/Runtime-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![Framework](https://img.shields.io/badge/API-Hono-E36002?style=for-the-badge)](https://hono.dev)
[![Language](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

_A globally distributed API for the KomikHQ reading experience._

</div>

---

## About the API

The KomikHQ API provides the backend services used by the KomikHQ web application. It is a TypeScript service built with Hono and deployed on Cloudflare Workers.

The API supports comic and chapter catalogs, search, genres, authentication, user profiles, bookmarks, reading history, comments, ratings, view tracking, sitemaps, and real-time features. Administrative endpoints support catalog and platform management.

This repository is also included as the `api` Git submodule in the [KomikHQ web application](https://github.com/komikhq/komikhq).

## Service overview

| Area                  | Responsibility                                                |
| --------------------- | ------------------------------------------------------------- |
| Catalog and discovery | Comics, chapters, genres, search, and rankings                |
| Reader accounts       | Authentication, user profiles, bookmarks, and reading history |
| Community             | Comments, ratings, and real-time presence                     |
| Platform services     | View tracking, sitemaps, storage, and administrative tools    |
| Runtime               | Hono on Cloudflare Workers                                    |
| Data and identity     | PostgreSQL through Drizzle ORM; Better Auth                   |

Versioned application routes are mounted under `/v1`. Health checks and sitemap XML routes are also provided. See the route registrations in `src/index.ts` for the current service surface.

## Local development

### Requirements

- Node.js `24.21.0`
- pnpm `12.3.4`
- A PostgreSQL database and the service credentials needed for the features you run locally

Install dependencies and prepare local environment variables:

```bash
pnpm install
cp .dev.vars.example .dev.vars
```

Update `.dev.vars` with valid local credentials and configuration. Do not commit this file or put secrets in issues or pull requests. Start the local Worker:

```bash
pnpm dev
```

Wrangler serves the API locally at `http://localhost:8787` by default.

## Project commands

| Command            | Purpose                           |
| ------------------ | --------------------------------- |
| `pnpm dev`         | Run the API locally with Wrangler |
| `pnpm test`        | Run the API test suite            |
| `pnpm typecheck`   | Check TypeScript types            |
| `pnpm db:generate` | Generate database migration files |
| `pnpm deploy`      | Deploy the Worker with Wrangler   |

Run database migrations against the intended database and review generated SQL before applying schema changes.

## Deployment and configuration

Cloudflare Worker bindings and runtime configuration are maintained in [`wrangler.jsonc`](./wrangler.jsonc). For production deployment, environment variables, secrets, and resource bindings, follow the [API deployment guide](./DEPLOYMENT.md).

## Related projects

- [KomikHQ](https://komikhq.com) — the reader-facing application
- [KomikHQ web application repository](https://github.com/komikhq/komikhq)
- [KomikHQ organization profile](https://github.com/komikhq)

---

<div align="center">

<sub>Part of the KomikHQ platform.</sub>

</div>
