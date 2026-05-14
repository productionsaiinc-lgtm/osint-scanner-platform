# GitHub Deploy Webhook Reference

This app now exposes a signed GitHub push webhook endpoint that can pull and rebuild the project when GitHub receives a push to the deployment branch. Valid push events are accepted immediately, then the pull/build runs in the background so GitHub does not time out waiting for the build.

## Endpoint

Use this payload URL in GitHub after the change is deployed:

```text
https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy
```

If the deployed domain changes, replace the host and keep the same path:

```text
https://YOUR_DOMAIN/api/webhooks/github/deploy
```

## GitHub Settings

In GitHub:

1. Open `productionsaiinc-lgtm/osint-scanner-platform`.
2. Go to `Settings` -> `Webhooks`.
3. Click `Add webhook`.
4. Set `Payload URL` to:

   ```text
   https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy
   ```

5. Set `Content type` to:

   ```text
   application/json
   ```

6. Set `Secret` to the exact value configured as `GITHUB_WEBHOOK_SECRET` in the deployment environment.
7. Select `Just the push event`.
8. Keep `Active` checked.
9. Save the webhook.

GitHub sends a `ping` event when the webhook is created. The app should return:

```json
{
  "success": true,
  "message": "GitHub deploy webhook is ready"
}
```

For a valid `push` event, the app should return `202 Accepted`:

```json
{
  "accepted": true,
  "message": "Deploy accepted"
}
```

## Required Environment Variable

Set this in Manus or the deployment environment:

```bash
GITHUB_WEBHOOK_SECRET="use-a-long-random-secret"
```

Generate a local secret with:

```bash
openssl rand -hex 32
```

Use the generated value in both places:

- GitHub webhook `Secret`
- Deployment environment `GITHUB_WEBHOOK_SECRET`

## Optional Environment Variables

Defaults are tuned for this repo:

```bash
GITHUB_DEPLOY_BRANCH=main
GITHUB_DEPLOY_REMOTE=origin
GITHUB_DEPLOY_INSTALL_COMMAND="pnpm install --frozen-lockfile"
GITHUB_DEPLOY_BUILD_COMMAND="pnpm run build"
```

Optional restart hook:

```bash
GITHUB_DEPLOY_RESTART_COMMAND=""
```

Only set `GITHUB_DEPLOY_RESTART_COMMAND` if the host supports a safe restart command. Pulling and rebuilding updates files, but server-code changes do not affect the already-running Node process until the host restarts it.

## What The Endpoint Does

For signed `push` events to `main`, the endpoint:

1. Verifies `X-Hub-Signature-256` using `GITHUB_WEBHOOK_SECRET`.
2. Ignores non-push events.
3. Ignores branches other than `GITHUB_DEPLOY_BRANCH`.
4. Accepts the webhook immediately.
5. Runs `git pull origin main` by default in the background.
6. Runs dependency install only when dependency files changed.
7. Runs `pnpm run build` by default.
8. Runs `GITHUB_DEPLOY_RESTART_COMMAND` if configured.

## Status Check

The status endpoint is:

```text
https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy/status
```

It requires the same secret as a bearer token:

```bash
curl \
  -H "Authorization: Bearer $GITHUB_WEBHOOK_SECRET" \
  https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy/status
```

The status response includes `deploy.running`, `deploy.lastStartedAt`, `deploy.lastFinishedAt`, and `deploy.lastResult`.

## Security Notes

- Never leave `GITHUB_WEBHOOK_SECRET` empty in production.
- Never paste the webhook secret into committed files.
- Use `application/json`; the endpoint verifies the raw JSON body.
- Use only the `push` event unless another event is intentionally supported later.
- Do not set deploy commands from untrusted input. They are environment-controlled shell commands.

## Files

The endpoint is registered in:

```text
server/_core/index.ts
```

The deploy logic and signature verification live in:

```text
server/github-webhook-handler.ts
```
