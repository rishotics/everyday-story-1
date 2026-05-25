/**
 * One-time setup. Run after deploying so Telegram knows where to POST updates.
 *
 *   TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_SECRET=... \
 *   WEBHOOK_URL=https://<your-domain>/api/telegram/webhook \
 *   npx tsx scripts/setup-telegram-webhook.ts
 *
 * To find your TELEGRAM_CHAT_ID: message the bot once, then open
 *   https://api.telegram.org/bot<TOKEN>/getUpdates
 * and read message.from.id from the JSON.
 */
async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const url = process.env.WEBHOOK_URL;
  if (!token || !secret || !url) {
    throw new Error("Set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, WEBHOOK_URL");
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, secret_token: secret }),
  });
  console.log(res.status, await res.text());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
