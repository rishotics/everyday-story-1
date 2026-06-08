# Telegram Date Commands Implementation Plan

**Goal:** Implement the spec at `docs/superpowers/specs/2026-05-04-telegram-date-commands-design.md`.

**Tech Stack:** TypeScript, Vitest (already wired), Next.js App Router.

---

### Task 1: Add `istDayForYMD` (TDD)

**Files:** `lib/istDate.ts`, `lib/istDate.test.ts`

- [ ] Add failing test to `lib/istDate.test.ts`:

```ts
import { istDayForYMD } from "@/lib/istDate";

describe("istDayForYMD", () => {
  it("returns IST-day boundaries and anchor for a given YMD", () => {
    const r = istDayForYMD(2026, 6, 21);
    // IST 2026-06-21 00:00 === 2026-06-20T18:30:00Z
    expect(r.anchor.toISOString()).toBe("2026-06-20T18:30:00.000Z");
    expect(r.start.toISOString()).toBe("2026-06-20T18:30:00.000Z");
    expect(r.end.toISOString()).toBe("2026-06-21T18:29:59.999Z");
  });
});
```

- [ ] Run `npm test` — expect failure (function not exported).
- [ ] Append to `lib/istDate.ts`:

```ts
export function istDayForYMD(
  y: number,
  m: number,
  d: number
): { start: Date; end: Date; anchor: Date } {
  // IST midnight of (y, m, d) as a UTC instant.
  const anchor = new Date(Date.UTC(y, m - 1, d) - IST_OFFSET_MS);
  const end = new Date(anchor.getTime() + 86_400_000 - 1);
  return { start: anchor, end, anchor };
}
```

- [ ] Run `npm test` — expect 4 passing tests.
- [ ] Commit: `feat: add istDayForYMD helper`.

---

### Task 2: Implement `parseDateCommand` (TDD)

**Files:** `lib/dateCommand.ts`, `lib/dateCommand.test.ts`

- [ ] Create `lib/dateCommand.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseDateCommand } from "@/lib/dateCommand";

// All "now" values below = 2026-05-04 12:00 UTC === 2026-05-04 17:30 IST
const now = new Date("2026-05-04T12:00:00.000Z");

describe("parseDateCommand", () => {
  it("treats text without a leading slash as no command", () => {
    expect(parseDateCommand("hello", now)).toEqual({ kind: "none" });
  });

  it("parses /today + text", () => {
    const r = parseDateCommand("/today hello world", now);
    expect(r).toEqual({
      kind: "ok",
      ymd: { y: 2026, m: 5, d: 4 },
      body: "hello world",
    });
  });

  it("parses /yesterday + text", () => {
    const r = parseDateCommand("/yesterday hi", now);
    expect(r).toEqual({
      kind: "ok",
      ymd: { y: 2026, m: 5, d: 3 },
      body: "hi",
    });
  });

  it("parses /dd-mm-yy + text", () => {
    const r = parseDateCommand("/21-04-26 walked in the rain", now);
    expect(r).toEqual({
      kind: "ok",
      ymd: { y: 2026, m: 4, d: 21 },
      body: "walked in the rain",
    });
  });

  it("parses /dd-mm-yyyy + text", () => {
    const r = parseDateCommand("/21-04-2026 ok", now);
    expect(r).toEqual({
      kind: "ok",
      ymd: { y: 2026, m: 4, d: 21 },
      body: "ok",
    });
  });

  it("returns empty error for command with no body", () => {
    expect(parseDateCommand("/yesterday", now)).toEqual({
      kind: "error",
      reason: "empty",
    });
    expect(parseDateCommand("/yesterday   ", now)).toEqual({
      kind: "error",
      reason: "empty",
    });
  });

  it("returns unparseable for invalid date", () => {
    expect(parseDateCommand("/32-13-26 hi", now)).toEqual({
      kind: "error",
      reason: "unparseable",
    });
  });

  it("returns unparseable for unknown command", () => {
    expect(parseDateCommand("/foo hi", now)).toEqual({
      kind: "error",
      reason: "unparseable",
    });
  });

  it("returns future error for tomorrow's date", () => {
    expect(parseDateCommand("/05-05-26 hi", now)).toEqual({
      kind: "error",
      reason: "future",
    });
  });

  it("accepts today via dd-mm-yy as ok (not future)", () => {
    const r = parseDateCommand("/04-05-26 hi", now);
    expect(r).toEqual({
      kind: "ok",
      ymd: { y: 2026, m: 5, d: 4 },
      body: "hi",
    });
  });
});
```

- [ ] Run `npm test` — expect failure (module not found).
- [ ] Create `lib/dateCommand.ts`:

```ts
import { istMidnightUTC } from "@/lib/istDate";

export type DateCommand =
  | { kind: "none" }
  | { kind: "ok"; ymd: { y: number; m: number; d: number }; body: string }
  | { kind: "error"; reason: "empty" | "future" | "unparseable" };

const NUMERIC = /^\/(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/;
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

function istYmdFromInstant(instant: Date): { y: number; m: number; d: number } {
  const ist = new Date(instant.getTime() + IST_OFFSET_MS);
  return {
    y: ist.getUTCFullYear(),
    m: ist.getUTCMonth() + 1,
    d: ist.getUTCDate(),
  };
}

function isValidYmd(y: number, m: number, d: number): boolean {
  const t = Date.UTC(y, m - 1, d);
  const back = new Date(t);
  return (
    back.getUTCFullYear() === y &&
    back.getUTCMonth() === m - 1 &&
    back.getUTCDate() === d
  );
}

export function parseDateCommand(text: string, now: Date): DateCommand {
  if (!text.startsWith("/")) return { kind: "none" };

  const trimmed = text.trim();
  const spaceIdx = trimmed.search(/\s/);
  const head = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
  const body = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1).trim();

  const todayYmd = istYmdFromInstant(now);
  let target: { y: number; m: number; d: number };

  if (head === "/today") {
    target = todayYmd;
  } else if (head === "/yesterday") {
    const yesterdayInstant = new Date(now.getTime() - 86_400_000);
    target = istYmdFromInstant(yesterdayInstant);
  } else {
    const match = head.match(NUMERIC);
    if (!match) return { kind: "error", reason: "unparseable" };
    const d = Number(match[1]);
    const m = Number(match[2]);
    const yRaw = Number(match[3]);
    const y = yRaw < 100 ? 2000 + yRaw : yRaw;
    if (!isValidYmd(y, m, d)) return { kind: "error", reason: "unparseable" };
    target = { y, m, d };
  }

  if (!body) return { kind: "error", reason: "empty" };

  // Future check: compare anchored IST instants
  const todayAnchor = Date.UTC(todayYmd.y, todayYmd.m - 1, todayYmd.d);
  const targetAnchor = Date.UTC(target.y, target.m - 1, target.d);
  if (targetAnchor > todayAnchor) return { kind: "error", reason: "future" };

  return { kind: "ok", ymd: target, body };
}

// Silence unused-import lint in case of refactor.
void istMidnightUTC;
```

- [ ] Run `npm test` — expect all parser tests pass.
- [ ] Remove the `void istMidnightUTC` line (it was a guard; not needed if unused). Re-run tests.
- [ ] Commit: `feat: add parseDateCommand for Telegram date commands`.

---

### Task 3: Wire parser into webhook

**Files:** `app/api/telegram/webhook/route.ts`

- [ ] Replace the section after `if (!message.text)` reply with the parser flow from the spec (see "Component details" → webhook). Include `MONTHS` / `pad` helpers at module top.
- [ ] Run `npx tsc --noEmit` — expect no errors.
- [ ] Commit: `feat: handle /today /yesterday /dd-mm-yy commands in webhook`.

---

### Task 4: Full verification

- [ ] `npm test` — all tests green.
- [ ] `npx tsc --noEmit` — clean.
- [ ] `npm run build` — succeeds, both telegram routes still listed.
- [ ] Commit if anything moved.

---

### Task 5: Merge + deploy

- [ ] Merge to `main`, push.
- [ ] After Vercel redeploys, manual smoke: DM the bot `/yesterday test entry` and confirm `Saved ✓ (...)` + visible in Browse tab on the correct day.
