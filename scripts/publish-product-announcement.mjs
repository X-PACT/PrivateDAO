#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = new Set(process.argv.slice(2));
const getArg = (name, fallback = "") => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
};

const dryRun =
  args.has("--dry-run") ||
  process.env.PRIVATE_DAO_ANNOUNCEMENT_DRY_RUN !== "false";
const updateSite = args.has("--update-site") || args.has("--site");

const announcementPath = getArg(
  "--announcement",
  "apps/web/public/announcements/txline-match-settlement-2026-06-29.json",
);

const resolvedAnnouncementPath = path.resolve(process.cwd(), announcementPath);
const announcement = JSON.parse(fs.readFileSync(resolvedAnnouncementPath, "utf8"));
const announcementsDir = path.resolve(process.cwd(), "apps/web/public/announcements");
const feedJsonPath = path.join(announcementsDir, "feed.json");
const feedRssPath = path.join(announcementsDir, "rss.xml");

function requireText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Announcement is missing ${label}`);
  }
  return value.trim();
}

function summarizePlan(results) {
  return {
    dryRun,
    updateSite,
    announcement: announcement.id,
    title: announcement.title,
    url: announcement.url,
    channels: results.map((result) => ({
      channel: result.channel,
      status: result.status,
      detail: result.detail,
      posts: result.posts,
    })),
  };
}

function listAnnouncements() {
  if (!fs.existsSync(announcementsDir)) return [];
  return fs
    .readdirSync(announcementsDir)
    .filter((name) => name.endsWith(".json") && name !== "feed.json")
    .map((name) => {
      const file = path.join(announcementsDir, name);
      return JSON.parse(fs.readFileSync(file, "utf8"));
    })
    .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildRssFeed(items) {
  const rows = items
    .map((item) => {
      const pubDate = item.date ? new Date(`${item.date}T00:00:00.000Z`).toUTCString() : new Date().toUTCString();
      return [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.url)}</link>`,
        `      <guid>${escapeXml(item.url ?? item.id)}</guid>`,
        `      <pubDate>${escapeXml(pubDate)}</pubDate>`,
        `      <description>${escapeXml(item.summary)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>PrivateDAO Product Announcements</title>
    <link>https://privatedao.org/announcements/</link>
    <description>PrivateDAO product announcements and public product updates.</description>
${rows}
  </channel>
</rss>
`;
}

async function updateSiteFeeds() {
  const items = listAnnouncements();
  const feed = {
    title: "PrivateDAO Product Announcements",
    url: "https://privatedao.org/announcements/",
    updatedAt: new Date().toISOString(),
    count: items.length,
    items,
  };
  if (!updateSite) {
    return { channel: "site", status: dryRun ? "dry-run" : "skipped", detail: "pass --update-site to write feed.json and rss.xml", posts: 0 };
  }
  fs.mkdirSync(announcementsDir, { recursive: true });
  fs.writeFileSync(feedJsonPath, `${JSON.stringify(feed, null, 2)}\n`);
  fs.writeFileSync(feedRssPath, buildRssFeed(items));
  return { channel: "site", status: "updated", detail: "updated public announcements feed.json and rss.xml", posts: items.length };
}

async function postJson(url, payload, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  return text;
}

function normalizeXPost(value, index) {
  const text = requireText(value, `channels.x[${index}]`);
  if ([...text].length > 280) {
    throw new Error(`channels.x[${index}] is longer than 280 characters`);
  }
  return text;
}

async function publishX() {
  const posts = Array.isArray(announcement.channels?.x) ? announcement.channels.x : [];
  if (posts.length === 0) {
    return { channel: "x", status: "skipped", detail: "no X posts in announcement", posts: 0 };
  }
  const userBearerToken =
    process.env.PRIVATE_DAO_X_USER_BEARER_TOKEN ||
    process.env.PRIVATE_DAO_X_OAUTH2_USER_ACCESS_TOKEN;
  if (userBearerToken) {
    if (dryRun) {
      return { channel: "x", status: "dry-run", detail: "would call X API /2/tweets", posts: posts.length };
    }
    const apiBase = process.env.PRIVATE_DAO_X_API_BASE || "https://api.x.com";
    for (const [index, post] of posts.entries()) {
      await postJson(
        `${apiBase.replace(/\/$/, "")}/2/tweets`,
        { text: normalizeXPost(post, index) },
        { authorization: `Bearer ${userBearerToken}` },
      );
    }
    return { channel: "x", status: "posted", detail: "sent via X API /2/tweets", posts: posts.length };
  }
  const webhookUrl = process.env.PRIVATE_DAO_X_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      channel: "x",
      status: dryRun ? "dry-run" : "skipped",
      detail: "PRIVATE_DAO_X_USER_BEARER_TOKEN or PRIVATE_DAO_X_WEBHOOK_URL not set",
      posts: posts.length,
    };
  }
  if (dryRun) {
    return { channel: "x", status: "dry-run", detail: "would send posts to X webhook", posts: posts.length };
  }
  for (const [index, post] of posts.entries()) {
    await postJson(webhookUrl, {
      platform: "x",
      announcementId: announcement.id,
      index,
      text: normalizeXPost(post, index),
      url: announcement.url,
    });
  }
  return { channel: "x", status: "posted", detail: "sent to X webhook", posts: posts.length };
}

async function publishTelegram() {
  const text = requireText(announcement.channels?.telegram, "channels.telegram");
  const botToken = process.env.PRIVATE_DAO_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.PRIVATE_DAO_TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return {
      channel: "telegram",
      status: dryRun ? "dry-run" : "skipped",
      detail: "PRIVATE_DAO_TELEGRAM_BOT_TOKEN or PRIVATE_DAO_TELEGRAM_CHAT_ID not set",
      posts: 1,
    };
  }
  if (dryRun) {
    return { channel: "telegram", status: "dry-run", detail: "would call Telegram sendMessage", posts: 1 };
  }
  await postJson(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    chat_id: chatId,
    text,
    disable_web_page_preview: false,
  });
  return { channel: "telegram", status: "posted", detail: "sent via Telegram Bot API", posts: 1 };
}

async function publishDiscord() {
  const content = requireText(announcement.channels?.discord, "channels.discord");
  const botToken = process.env.PRIVATE_DAO_DISCORD_BOT_TOKEN;
  const channelId = process.env.PRIVATE_DAO_DISCORD_CHANNEL_ID;
  if (botToken && channelId) {
    if (dryRun) {
      return { channel: "discord", status: "dry-run", detail: "would call Discord Bot API", posts: 1 };
    }
    await postJson(
      `https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`,
      {
        content,
        allowed_mentions: { parse: [] },
      },
      { authorization: `Bot ${botToken}` },
    );
    return { channel: "discord", status: "posted", detail: "sent via Discord Bot API", posts: 1 };
  }
  const webhookUrl = process.env.PRIVATE_DAO_DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      channel: "discord",
      status: dryRun ? "dry-run" : "skipped",
      detail: "PRIVATE_DAO_DISCORD_BOT_TOKEN plus PRIVATE_DAO_DISCORD_CHANNEL_ID or PRIVATE_DAO_DISCORD_WEBHOOK_URL not set",
      posts: 1,
    };
  }
  if (dryRun) {
    return { channel: "discord", status: "dry-run", detail: "would call Discord webhook", posts: 1 };
  }
  await postJson(webhookUrl, {
    username: "PrivateDAO Product",
    content,
    allowed_mentions: { parse: [] },
  });
  return { channel: "discord", status: "posted", detail: "sent via Discord webhook", posts: 1 };
}

async function publishAnnouncementApi() {
  const apiUrl = process.env.PRIVATE_DAO_ANNOUNCEMENT_API_URL;
  if (!apiUrl) {
    return { channel: "privatedao-api", status: dryRun ? "dry-run" : "skipped", detail: "PRIVATE_DAO_ANNOUNCEMENT_API_URL not set", posts: 1 };
  }
  if (dryRun) {
    return { channel: "privatedao-api", status: "dry-run", detail: "would post announcement to PrivateDAO API", posts: 1 };
  }
  const apiToken = process.env.PRIVATE_DAO_ANNOUNCEMENT_API_TOKEN;
  await postJson(
    apiUrl,
    { announcement },
    apiToken ? { authorization: `Bearer ${apiToken}` } : {},
  );
  return { channel: "privatedao-api", status: "posted", detail: "sent announcement to PrivateDAO API", posts: 1 };
}

async function publishExtraWebhooks() {
  const raw = process.env.PRIVATE_DAO_ANNOUNCEMENT_WEBHOOKS ?? "";
  const urls = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (urls.length === 0) {
    return { channel: "extra-webhooks", status: dryRun ? "dry-run" : "skipped", detail: "PRIVATE_DAO_ANNOUNCEMENT_WEBHOOKS not set", posts: 0 };
  }
  if (dryRun) {
    return { channel: "extra-webhooks", status: "dry-run", detail: "would post to Slack/Farcaster/Warpcast-compatible webhooks", posts: urls.length };
  }
  for (const url of urls) {
    await postJson(url, { announcement });
  }
  return { channel: "extra-webhooks", status: "posted", detail: "sent announcement to configured extra webhooks", posts: urls.length };
}

const results = [];
for (const publish of [updateSiteFeeds, publishX, publishTelegram, publishDiscord, publishAnnouncementApi, publishExtraWebhooks]) {
  try {
    results.push(await publish());
  } catch (error) {
    results.push({
      channel: publish.name.replace(/^publish/, "").toLowerCase(),
      status: "failed",
      detail: error instanceof Error ? error.message : String(error),
      posts: 0,
    });
  }
}

console.log(JSON.stringify(summarizePlan(results), null, 2));

if (!dryRun) {
  const logPath = process.env.PRIVATE_DAO_ANNOUNCEMENT_LOG_PATH;
  if (logPath) {
    fs.appendFileSync(path.resolve(process.cwd(), logPath), `${JSON.stringify({ at: new Date().toISOString(), results })}\n`);
  }
}
