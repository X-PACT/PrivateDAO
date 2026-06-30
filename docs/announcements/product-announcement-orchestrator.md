# Product Announcement Orchestrator

PrivateDAO announcements are published from one public JSON file.

Current announcement:

- `apps/web/public/announcements/txline-match-settlement-2026-06-29.json`

One command updates the site feeds and prepares channel publishing:

```bash
npm run announce:txline:dry-run
```

Live publishing uses the same script:

```bash
PRIVATE_DAO_ANNOUNCEMENT_DRY_RUN=false npm run announce:txline
```

## What It Updates

- Website announcement data
- `https://privatedao.org/announcements/`
- `https://privatedao.org/announcements/feed.json`
- `https://privatedao.org/announcements/rss.xml`
- X posts through `PRIVATE_DAO_X_USER_BEARER_TOKEN` and `POST /2/tweets`
- X webhook fallback through `PRIVATE_DAO_X_WEBHOOK_URL`
- Telegram through `PRIVATE_DAO_TELEGRAM_BOT_TOKEN` and `PRIVATE_DAO_TELEGRAM_CHAT_ID`
- Discord through `PRIVATE_DAO_DISCORD_BOT_TOKEN` and `PRIVATE_DAO_DISCORD_CHANNEL_ID`
- Discord webhook fallback through `PRIVATE_DAO_DISCORD_WEBHOOK_URL`
- PrivateDAO API through `PRIVATE_DAO_ANNOUNCEMENT_API_URL`
- Extra webhooks through `PRIVATE_DAO_ANNOUNCEMENT_WEBHOOKS`

## Required Settings

Set these in GitHub Actions Secrets or AWS Lambda environment variables:

```bash
PRIVATE_DAO_ANNOUNCEMENT_DRY_RUN=false
PRIVATE_DAO_X_USER_BEARER_TOKEN=
PRIVATE_DAO_TELEGRAM_BOT_TOKEN=
PRIVATE_DAO_TELEGRAM_CHAT_ID=
PRIVATE_DAO_DISCORD_BOT_TOKEN=
PRIVATE_DAO_DISCORD_CHANNEL_ID=
PRIVATE_DAO_ANNOUNCEMENT_API_URL=
PRIVATE_DAO_ANNOUNCEMENT_API_TOKEN=
PRIVATE_DAO_ANNOUNCEMENT_WEBHOOKS=
```

Optional fallback settings:

```bash
PRIVATE_DAO_X_API_BASE=https://api.x.com
PRIVATE_DAO_X_WEBHOOK_URL=
PRIVATE_DAO_DISCORD_WEBHOOK_URL=
PRIVATE_DAO_ANNOUNCEMENT_LOG_PATH=docs/announcements/published-log.jsonl
```

X requires a user-context OAuth2 access token with permission to post tweets. Discord requires a bot invited to the server with permission to send messages in the target channel. Telegram requires the bot to be a member or admin of the destination group/channel.

## Orchestrators

The same script can run from:

- Local operator terminal
- GitHub Actions workflow: `.github/workflows/publish-announcement.yml`
- AWS Lambda or any private runner with Node 20+

Secrets must stay in the orchestrator secret store. They must not be committed.

## Safety

Dry-run is the default.

Set `PRIVATE_DAO_ANNOUNCEMENT_DRY_RUN=false` only inside a trusted runtime that owns the posting credentials.
