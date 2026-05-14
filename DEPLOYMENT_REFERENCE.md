# OSINT Scanner Platform Deployment Reference

This is the deployment source of truth for the current checkout at `/root/Desktop/github/osint-scanner-platform`.

The app is not just static HTML. It is a Vite React frontend plus an Express/tRPC backend. A full production deployment must run the Node server because authentication, `/api/trpc`, OAuth callbacks, database-backed tools, webhooks, short links, canary tokens, MDM enrollment, payments, AI assistant, cloud storage, and provider-backed OSINT tools depend on server code.

## Current Repository

- GitHub repo: `https://github.com/productionsaiinc-lgtm/osint-scanner-platform.git`
- Live Manus site in existing docs: `https://osintscan-fftqerzj.manus.space`
- Local working directory: `/root/Desktop/github/osint-scanner-platform`
- Main branch deployment trigger: push a commit to `main`
- Current local remotes expected for this checkout:

```bash
git remote -v
```

Expected:

```text
origin      https://github.com/productionsaiinc-lgtm/osint-scanner-platform.git (fetch)
origin      https://github.com/productionsaiinc-lgtm/osint-scanner-platform.git (push)
user_github https://github.com/productionsaiinc-lgtm/osint-scanner-platform.git (fetch)
user_github https://github.com/productionsaiinc-lgtm/osint-scanner-platform.git (push)
```

Either remote can push the same repository:

```bash
git push origin main
git push user_github main
```

## App Architecture

Build outputs:

- Frontend static files: `dist/public`
- Bundled backend entry: `dist/index.js`

Important files:

- `package.json` - scripts for dev, build, start, test, type check, migrations
- `vite.config.ts` - Vite root is `client`, build output is `dist/public`
- `server/_core/index.ts` - Express production server and API registration
- `server/routers.ts` - tRPC API surface
- `API_KEYS_REQUIRED.md` - provider and production environment requirements
- `vercel.json` - Vercel-style route/build mapping
- `Dockerfile` and `docker-compose.yml` - container deployment path if present in this checkout

## Required Runtime

Use Node 22 for the Docker path because the Dockerfile is based on `node:22-slim`.

The local repo currently works with `npm` for build verification. The lockfile and Dockerfile use `pnpm`, so hosted/container environments should use Corepack or install pnpm through Node's package manager support.

Core commands:

```bash
npm run dev
npm run build
npm run start
npm run check
npm run test
npm run db:push
```

Script behavior:

- `npm run dev` starts the Express server with Vite middleware.
- `npm run build` runs `vite build` and bundles `server/_core/index.ts` into `dist/index.js`.
- `npm run start` runs `NODE_ENV=production node dist/index.js`.
- `npm run check` runs TypeScript checking.
- `npm run test` runs Vitest tests.
- `npm run db:push` generates and runs Drizzle migrations.

## Environment Variables

Production needs at least:

```bash
DATABASE_URL=
JWT_SECRET=
VITE_APP_URL=
NODE_ENV=production
PORT=3000
```

OAuth/runtime variables used by the app:

```bash
OAUTH_SERVER_URL=
OWNER_OPEN_ID=
VITE_APP_ID=
VITE_OAUTH_PORTAL_URL=
```

Manus/Forge variables:

```bash
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=
```

Analytics variables used by `client/index.html`:

```bash
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

Provider keys are documented in `API_KEYS_REQUIRED.md`. Missing provider keys should produce clear provider-required messages for affected tools instead of fake results.

Common provider keys:

```bash
VIRUSTOTAL_API_KEY=
HIBP_API_KEY=
HUNTER_API_KEY=
GITHUB_TOKEN=
GITHUB_API_KEY=
SHODAN_API_KEY=
SECURITYTRAILS_API_KEY=
IPQUALITYSCORE_API_KEY=
IPQS_API_KEY=
AVIATIONSTACK_API_KEY=
NUMVERIFY_API_KEY=
ABSTRACT_PHONE_API_KEY=
WHOIS_API_KEY=
NVD_API_KEY=
MAXMIND_API_KEY=
```

Payments, payouts, storage, and email:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_WEBHOOK_SECRET=
PAYPAL_PAYOUT_EMAIL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
S3_REGION=
S3_BUCKET=
EMAIL_USER=
EMAIL_PASSWORD=
```

Do not commit `.env`, `.env.local`, `.env.docker`, provider keys, database passwords, OAuth secrets, webhook secrets, or cloud credentials.

## Local Development

From the repo root:

```bash
cd /root/Desktop/github/osint-scanner-platform
npm install
npm run dev
```

Open the local URL printed by the server, usually:

```text
http://localhost:3000
```

If port `3000` is taken, the server searches for the next available port.

## Local Production Build

Use this before pushing:

```bash
cd /root/Desktop/github/osint-scanner-platform
npm run build
```

Run the built production server:

```bash
NODE_ENV=production PORT=3000 npm run start
```

Then open:

```text
http://localhost:3000
```

Production mode serves static frontend files from `dist/public` and API routes from the Node server.

## Database Setup

Set `DATABASE_URL` before running migrations or starting production.

Example shape:

```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
```

Run migrations:

```bash
npm run db:push
```

The server also runs selected table setup on startup through:

- `server/migrations/create-monitoring-tables.ts`
- `server/migrations/create-medium-priority-tables.ts`
- `server/migrations/create-mdm-tables.ts`

## Manus GitHub Deployment

The existing project docs describe Manus auto-deployment from GitHub `main`.

Normal deploy:

```bash
cd /root/Desktop/github/osint-scanner-platform
git status
npm run build
git add .
git commit -m "Describe the deployment change"
git push origin main
```

Because `user_github` points to the same repo in this checkout, this is also valid:

```bash
git push user_github main
```

Manus should detect the pushed commit, sync the repo, rebuild, and deploy. Existing docs say this typically takes 2-5 minutes.

If there are no file changes but Manus needs a redeploy trigger:

```bash
git commit --allow-empty -m "chore: trigger Manus redeploy"
git push origin main
```

Check what commit GitHub sees:

```bash
git ls-remote origin main
```

Check local branch state:

```bash
git status
git log --oneline -5
```

If a change is not visible on the live site, check in this order:

1. Confirm the pushed commit is on GitHub `main`.
2. Check Manus deployment logs/status.
3. Confirm the changed feature is not behind authentication.
4. Confirm the route being viewed is the changed route. Dashboard features are not visible on the public landing page.
5. Trigger a new deploy with an empty commit if the deployment appears stale.

## Static Frontend Only

Static hosting is possible only for the frontend bundle:

```bash
npm run build
```

Static assets are written to:

```text
dist/public
```

You can upload `dist/public` to a static host, but the complete application will not work without a backend unless the frontend is changed to point at a deployed API server.

Required code change for static frontend plus separate backend:

- Replace the hardcoded tRPC URL `"/api/trpc"` in `client/src/main.tsx` with an environment-based API base URL.
- Configure CORS and credentials on the backend.
- Set the static host environment variable to the backend public URL.
- Make sure OAuth callback URLs and cookie settings match the split frontend/backend domains.

Do not expose private provider keys in frontend code. Provider-backed OSINT calls must stay server-side.

## Fully Static HTML Limitations

A fully static deployment can only support public pages and client-only demo flows.

These features require the backend:

- Login/logout and session cookies
- Dashboard user state
- Scan history and persisted results
- `/api/trpc`
- OAuth callback routes
- Stripe and PayPal webhooks
- AI assistant calls
- Database-backed OSINT workflows
- Cloud storage uploads/download URLs
- Canary token triggers and stats
- URL shortener redirects and analytics
- MDM enrollment and device records
- Temporary email backend
- Virtual computers and virtual phones
- Provider keys that must stay secret

## Docker Deployment

If using the Docker files in this checkout:

```bash
docker compose up --build
```

The app is exposed on:

```text
http://localhost:3000
```

The compose file starts:

- `app` - production Node app
- `mysql` - MySQL 8.4 database
- `migrate` - optional migration profile

Run the migration profile:

```bash
docker compose --profile tools run --rm migrate
```

Docker env file:

```text
.env.docker
```

Keep `.env.docker` out of Git. Commit only an example file with placeholder values.

## Vercel-Style Deployment

`vercel.json` currently defines:

- `server/_core/index.ts` as a Node function
- `vite.config.ts` as the static build
- `/api/(.*)` routed to the server
- all other paths routed to the built static output

Before using Vercel or a similar platform, verify:

1. Node runtime supports this server bundle and dependencies.
2. Long-running or stateful features are compatible with serverless execution.
3. Webhook raw body behavior still works.
4. Database connections are pooled safely for serverless.
5. File upload size and timeout limits are acceptable.

For this project, a persistent Node deployment is safer than a pure serverless deployment because several features use webhooks, migrations, provider calls, storage, and database-backed workflows.

## Deployment Checklist

Before deploy:

```bash
git status
npm run check
npm run test
npm run build
```

Environment:

- `DATABASE_URL` points at production MySQL.
- `JWT_SECRET` is strong and unique.
- `VITE_APP_URL` matches the deployed public URL.
- OAuth redirect/callback settings match the deployed URL.
- Payment webhook URLs point to production.
- Provider keys are installed only in the production secret store.
- S3/storage credentials are production-safe.
- Email credentials are configured if alerts are enabled.

After deploy:

- Public landing page loads.
- Login flow starts and returns correctly.
- Authenticated dashboard loads.
- `/api/trpc` responds through the app.
- A simple public-data tool works.
- A provider-backed tool with a configured key works.
- A provider-backed tool without a key returns a clear provider-required message.
- Payment webhook endpoints are reachable if payments are enabled.
- Canary token and short-link routes work if those features are enabled.

## Troubleshooting

Build fails:

```bash
npm run check
npm run test
npm run build
```

Look for TypeScript errors, missing env variables, missing package installs, or provider SDK issues.

Production starts but page is blank:

- Confirm `dist/public` exists after build.
- Confirm `NODE_ENV=production`.
- Check browser console for asset path errors.
- Check server logs.

API returns unauthorized:

- Confirm cookies are being sent.
- Confirm `JWT_SECRET` matches the environment that issued the session.
- Confirm OAuth callback URL and app URL match production.

Changes pushed but not visible:

```bash
git ls-remote origin main
git log --oneline -5
```

Then check Manus deployment logs and verify whether the changed route is public or authenticated.

Provider-backed tools return provider errors:

- Check `API_KEYS_REQUIRED.md`.
- Add the missing provider key to the deployment secret store.
- Redeploy or restart the app so the server picks up the new env.

Database errors:

- Verify `DATABASE_URL`.
- Confirm the database is reachable from the deployment environment.
- Run migrations.
- Check MySQL user permissions.

Webhook errors:

- Confirm public webhook URL.
- Confirm webhook secret values.
- Confirm raw-body-sensitive webhooks are registered before JSON parsing. This is handled in `server/_core/index.ts`.

## Rollback

Git rollback:

```bash
git revert HEAD
git push origin main
```

Manus rollback:

- Open Manus Management UI.
- Go to deployment/version history.
- Select the last known good deployment.
- Roll back or redeploy that version.

## Quick Commands

```bash
cd /root/Desktop/github/osint-scanner-platform
git status
npm run check
npm run test
npm run build
git add .
git commit -m "Deploy update"
git push origin main
```

Redeploy without code changes:

```bash
git commit --allow-empty -m "chore: trigger Manus redeploy"
git push origin main
```
