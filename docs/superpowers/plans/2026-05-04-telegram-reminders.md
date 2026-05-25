# Telegram Reminder Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Telegram bot that DMs the user an AI-personalized journaling prompt at 10:00 and 01:00 IST and saves any text reply into that day's story.

**Architecture:** Two Next.js API routes — a Vercel-Cron-triggered `cron` route that generates a prompt with Claude and sends it via the Telegram Bot API, and a `webhook` route that receives the user's replies and appends them to the IST-day's story in MongoDB. Shared helpers for the Telegram client, prompt generation, and IST day-boundary math. No schema changes.

**Tech Stack:** Next.js 16 App Router, TypeScript, Mongoose, `@anthropic-ai/sdk`, native `fetch` for Telegram, Vitest for unit tests.

---

## File Structure

```
lib/istDate.ts                      IST day-boundary helpers (pure, unit-tested)
lib/telegram.ts                     sendMessage() Telegram client
lib/promptGenerator.ts              Claude prompt + static fallback pool
app/api/telegram/cron/route.ts      GET — Vercel Cron → Claude → Telegram
app/api/telegram/webhook/route.ts   POST — Telegram → append to story
scripts/setup-telegram-webhook.ts   one-time webhook registration
vercel.json                         two cron entries
vitest.config.ts                    test config
lib/istDate.test.ts                 unit tests for date helpers
.env.example                        documented new env var names
```

---

### Task 1: Set up Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`
Expected: adds `vitest` to devDependencies.

- [ ] **Step 2: Add test script to package.json**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 4: Verify the runner works**

Run: `npm test`
Expected: exits 0 with "No test files found" (or similar) — confirms Vitest is wired up.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest test runner"
```

---

### Task 2: IST date helpers (TDD)

**Files:**
- Create: `lib/istDate.ts`
- Test: `lib/istDate.test.ts`

IST is UTC+5:30 with no DST, so the offset is a constant 330 minutes.

- [ ] **Step 1: Write the failing tests**

Create `lib/istDate.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { istDayRange, istMidnightUTC } from "@/lib/istDate";

describe("istMidnightUTC", () => {
  it("maps 01:00 IST to that IST calendar day's midnight (in UTC)", () => {
    // 2026-05-05 01:00 IST === 2026-05-04 19:30 UTC
    const now = new Date("2026-05-04T19:30:00.000Z");
    // IST midnight of 2026-05-05 === 2026-05-04T18:30:00Z
    expect(istMidnightUTC(now).toISOString()).toBe("2026-05-04T18:30:00.000Z");
  });

  it("maps 10:00 IST to the same IST day's midnight", () => {
    // 2026-05-05 10:00 IST === 2026-05-05 04:30 UTC
    const now = new Date("2026-05-05T04:30:00.000Z");
    expect(istMidnightUTC(now).toISOString()).toBe("2026-05-04T18:30:00.000Z");
  });
});

describe("istDayRange", () => {
  it("brackets the full IST day as UTC instants", () => {
    const now = new Date("2026-05-04T19:30:00.000Z"); // 2026-05-05 01:00 IST
    const { start, end } = istDayRange(now);
    // IST day 2026-05-05 spans 2026-05-04T18:30:00Z .. 2026-05-05T18:29:59.999Z
    expect(start.toISOString()).toBe("2026-05-04T18:30:00.000Z");
    expect(end.toISOString()).toBe("2026-05-05T18:29:59.999Z");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/istDate` / functions not defined.

- [ ] **Step 3: Implement lib/istDate.ts**

```typescript
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000; // +5:30

/** UTC instant of IST-midnight for the IST calendar day containing `now`. */
export function istMidnightUTC(now: Date = new Date()): Date {
  const istMs = now.getTime() + IST_OFFSET_MS;
  const istMidnightMs = Math.floor(istMs / 86_400_000) * 86_400_000;
  return new Date(istMidnightMs - IST_OFFSET_MS);
}

/** UTC instants bracketing the IST calendar day containing `now`. */
export function istDayRange(now: Date = new Date()): { start: Date; end: Date } {
  const start = istMidnightUTC(now);
  const end = new Date(start.getTime() + 86_400_000 - 1);
  return { start, end };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/istDate.ts lib/istDate.test.ts
git commit -m "feat: add IST day-boundary helpers"
```

---

### Task 3: Telegram client

**Files:**
- Create: `lib/telegram.ts`

- [ ] **Step 1: Implement lib/telegram.ts**

```typescript
const API_BASE = "https://api.telegram.org";

export async function sendMessage(
  chatId: string | number,
  text: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const res = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram sendMessage failed: ${res.status} ${body}`);
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/telegram.ts
git commit -m "feat: add Telegram sendMessage client"
```

---

### Task 4: Prompt generator

**Files:**
- Create: `lib/promptGenerator.ts`

Reuses the Anthropic model id already used in `app/api/ai/route.ts` (`claude-sonnet-4-20250514`) for consistency.

- [ ] **Step 1: Implement lib/promptGenerator.ts**

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { connectDB } from "@/lib/mongodb";
import Story from "@/models/Story";

const anthropic = new Anthropic();

type Slot = "morning" | "night";

const FALLBACK: Record<Slot, string[]> = {
  morning: [
    "Good morning. What's the story of your day so far?",
    "What are you walking into today that's worth remembering?",
    "What's one thing you're hoping happens today?",
  ],
  night: [
    "Before the day closes — what's the moment worth keeping?",
    "What surprised you today?",
    "If today were a single scene, what would it be?",
  ],
};

function randomFallback(slot: Slot): string {
  const pool = FALLBACK[slot];
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function generatePrompt(slot: Slot): Promise<string> {
  try {
    await connectDB();
    const stories = await Story.find().sort({ date: -1 }).limit(20);
    const context = stories
      .map((s) => {
        const d = new Date(s.date).toISOString().split("T")[0];
        return `[${d}] ${s.content}`;
      })
      .join("\n\n");

    const system = `You craft a daily journal nudge for someone practicing storytelling. Here are their recent stories:

${context || "(No stories yet)"}

Write ONE specific, warm question (20 words or fewer) that picks up a thread from their entries. Slot is "${slot}": morning => forward-looking; night => reflective. Output the question only, no preamble. At most one emoji at the end.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      system,
      messages: [{ role: "user", content: `Write the ${slot} nudge.` }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    return text || randomFallback(slot);
  } catch (err) {
    console.error("generatePrompt failed, using fallback:", err);
    return randomFallback(slot);
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/promptGenerator.ts
git commit -m "feat: add AI prompt generator with static fallback"
```

---

### Task 5: Cron route

**Files:**
- Create: `app/api/telegram/cron/route.ts`

- [ ] **Step 1: Implement app/api/telegram/cron/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generatePrompt } from "@/lib/promptGenerator";
import { sendMessage } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slot =
    new URL(request.url).searchParams.get("slot") === "night"
      ? "night"
      : "morning";
  const chatId = process.env.TELEGRAM_CHAT_ID!;

  try {
    const prompt = await generatePrompt(slot);
    await sendMessage(chatId, prompt);
  } catch (err) {
    console.error("cron send failed, retrying with fallback:", err);
    try {
      const fallback =
        slot === "night"
          ? "Before the day closes — what's the moment worth keeping?"
          : "Good morning. What's the story of your day so far?";
      await sendMessage(chatId, fallback);
    } catch (retryErr) {
      console.error("cron fallback also failed:", retryErr);
    }
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/telegram/cron/route.ts
git commit -m "feat: add Telegram cron route for daily prompts"
```

---

### Task 6: Webhook route

**Files:**
- Create: `app/api/telegram/webhook/route.ts`

- [ ] **Step 1: Implement app/api/telegram/webhook/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Story from "@/models/Story";
import { sendMessage } from "@/lib/telegram";
import { istDayRange, istMidnightUTC } from "@/lib/istDate";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update = await request.json();
    const message = update?.message;
    const chatId = process.env.TELEGRAM_CHAT_ID!;

    // Ignore anyone but the whitelisted user.
    if (!message || String(message.from?.id) !== String(chatId)) {
      return NextResponse.json({ ok: true });
    }

    if (!message.text) {
      await sendMessage(chatId, "I can only save text right now.");
      return NextResponse.json({ ok: true });
    }

    await connectDB();
    const now = new Date();
    const { start, end } = istDayRange(now);
    const existing = await Story.findOne({ date: { $gte: start, $lte: end } });

    if (existing) {
      existing.content = `${existing.content}\n\n${message.text}`;
      await existing.save();
    } else {
      await Story.create({ date: istMidnightUTC(now), content: message.text });
    }

    await sendMessage(chatId, "Saved ✓");
  } catch (err) {
    console.error("webhook handler failed:", err);
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/telegram/webhook/route.ts
git commit -m "feat: add Telegram webhook to append replies to stories"
```

---

### Task 7: Vercel cron config

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json**

```json
{
  "crons": [
    { "path": "/api/telegram/cron?slot=morning", "schedule": "30 4 * * *" },
    { "path": "/api/telegram/cron?slot=night", "schedule": "30 19 * * *" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: schedule daily Telegram cron at 10:00 and 01:00 IST"
```

---

### Task 8: Setup script + env docs

**Files:**
- Create: `scripts/setup-telegram-webhook.ts`
- Modify: `.env.example`

- [ ] **Step 1: Create scripts/setup-telegram-webhook.ts**

```typescript
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
```

- [ ] **Step 2: Append new env vars to .env.example**

Add these lines to `.env.example`:

```
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_CHAT_ID=your-numeric-chat-id
TELEGRAM_WEBHOOK_SECRET=generate-a-random-string
CRON_SECRET=generate-a-random-string
```

- [ ] **Step 3: Commit**

```bash
git add scripts/setup-telegram-webhook.ts .env.example
git commit -m "feat: add webhook setup script and document env vars"
```

---

### Task 9: Final verification

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: PASS — istDate tests green.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds; the two new routes appear under `/api/telegram/*`.

- [ ] **Step 4: Manual deploy checklist (documented, not run here)**

1. Set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`, `CRON_SECRET` in Vercel env.
2. Deploy.
3. Run `scripts/setup-telegram-webhook.ts` with the deployed URL to register the webhook.
4. DM the bot → confirm "Saved ✓" and that the story shows in the Browse tab.
5. Confirm cron entries appear in the Vercel dashboard.

---

## Notes

- All routes return 200 after authentication so neither Vercel Cron nor Telegram retry-storms on internal errors.
- Only `TELEGRAM_CHAT_ID` can write stories; all other senders are silently ignored.
- The web `StoryEditor` is unchanged — appending is webhook-only.
