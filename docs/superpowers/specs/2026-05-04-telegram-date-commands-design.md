# Telegram Date Commands — Design

**Date:** 2026-05-04
**Goal:** Let the user write a story for an arbitrary day from Telegram by prefixing the message with `/today`, `/yesterday`, or `/dd-mm-yy`(`yyyy`).

## Summary

Extend the existing Telegram webhook to recognize a date-targeting slash command at the start of a message. The command and the story text travel in the **same message** (one-shot, no state). The target day is computed in IST, the story is appended to (or created in) that day's `Story` document, and the bot acknowledges with `Saved ✓ (DD Mon YYYY)`.

## Decisions

| Topic | Decision |
|---|---|
| Mode | One-shot: `command + text` in one message; next message reverts to today |
| Commands | `/today`, `/yesterday`, `/dd-mm-yy`, `/dd-mm-yyyy` |
| Separator | Dashes only (`-`), no slashes |
| Year rule | 2-digit `yy` → `20yy`; 4-digit accepted as-is |
| Day boundary | IST midnight (existing `lib/istDate.ts`) |
| Empty body | Reply: `"Add the story after the command, e.g. /yesterday Walked in the rain."` |
| Future date | Reject. Reply: `"Can't write entries for future dates."` |
| Unparseable date | Reply: `"Couldn't parse the date. Use /dd-mm-yy or /dd-mm-yyyy."` |
| No leading `/` | Existing behavior preserved (append to today) |
| Save semantics | Append (newline-separated) to existing target-day story; create if none |
| Ack format | `Saved ✓ (DD Mon YYYY)` when a command was used; plain `Saved ✓` otherwise |

## Architecture

```
Telegram message → /api/telegram/webhook
        │
        ▼
parseDateCommand(text, now) ──► { kind: "none" | "ok" | "error" }
        │
   none ─┴──► append to today (existing path)
   error ───► sendMessage(<usage hint>)
   ok    ───► istDayForYMD(y, m, d) → find/create Story → append → sendMessage("Saved ✓ (...)")
```

## New / changed files

```
lib/dateCommand.ts                 NEW — pure parser
lib/dateCommand.test.ts            NEW — parser tests
lib/istDate.ts                     MODIFY — add istDayForYMD(y, m, d)
lib/istDate.test.ts                MODIFY — add istDayForYMD test
app/api/telegram/webhook/route.ts  MODIFY — wire the parser in
```

## Component details

### `lib/dateCommand.ts`

```ts
export type DateCommand =
  | { kind: "none" }
  | { kind: "ok"; ymd: { y: number; m: number; d: number }; body: string }
  | { kind: "error"; reason: "empty" | "future" | "unparseable" };

export function parseDateCommand(text: string, now: Date): DateCommand;
```

Algorithm:
1. If `text` doesn't start with `/`, return `{ kind: "none" }`.
2. Split at the first whitespace: `head` (the slash-token) and `body` (rest, trimmed). `body` may be empty.
3. Resolve `head`:
   - `/today` → today (IST)
   - `/yesterday` → today − 1 day (IST)
   - matches `^\/(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$` → `{ d, m, y }` where 2-digit `y` becomes `2000 + y`. Validate via `Date.UTC` round-trip (catches `32-13-26`).
   - anything else → `{ kind: "error", reason: "unparseable" }`
4. If `body` is empty → `{ kind: "error", reason: "empty" }`.
5. Compare target IST midnight vs `now`'s IST midnight; if target is strictly after today → `{ kind: "error", reason: "future" }`.
6. Otherwise → `{ kind: "ok", ymd, body }`.

The `today`/`yesterday` resolution uses IST so 01:30 IST still resolves to the correct IST calendar day.

### `lib/istDate.ts` (addition)

```ts
export function istDayForYMD(
  y: number, m: number, d: number
): { start: Date; end: Date; anchor: Date };
```

`anchor` is IST midnight of that day expressed as UTC (matches what `istMidnightUTC` returns for `now`). `start = anchor`, `end = anchor + 86_400_000 - 1`.

### `app/api/telegram/webhook/route.ts` (modification)

After the existing chat-ID whitelist and the `!message.text` guard, before the current Mongo write:

```ts
const parsed = parseDateCommand(message.text, new Date());

if (parsed.kind === "error") {
  const hint =
    parsed.reason === "empty"
      ? "Add the story after the command, e.g. /yesterday Walked in the rain."
      : parsed.reason === "future"
      ? "Can't write entries for future dates."
      : "Couldn't parse the date. Use /dd-mm-yy or /dd-mm-yyyy.";
  await sendMessage(chatId, hint);
  return NextResponse.json({ ok: true });
}

await connectDB();
let target: { start: Date; end: Date; anchor: Date };
let body: string;
let label: string | null;

if (parsed.kind === "ok") {
  target = istDayForYMD(parsed.ymd.y, parsed.ymd.m, parsed.ymd.d);
  body = parsed.body;
  label = `${pad(parsed.ymd.d)} ${MONTHS[parsed.ymd.m - 1]} ${parsed.ymd.y}`; // e.g. "21 Jun 2026"
} else {
  const now = new Date();
  const { start, end } = istDayRange(now);
  target = { start, end, anchor: istMidnightUTC(now) };
  body = message.text;
  label = null;
}

const existing = await Story.findOne({ date: { $gte: target.start, $lte: target.end } });
if (existing) {
  existing.content = `${existing.content}\n\n${body}`;
  await existing.save();
} else {
  await Story.create({ date: target.anchor, content: body });
}

await sendMessage(chatId, label ? `Saved ✓ (${label})` : "Saved ✓");
```

`pad` and `MONTHS` are local helpers in the webhook file (private, not exported).

## Error handling
- All replies stay inside the existing `try` block; on any internal error the route still returns 200 (consistent with current behavior, prevents Telegram retry storms).
- Auth (chat-ID whitelist + secret header) is unchanged.

## Testing
- **`lib/dateCommand.test.ts`** — exhaustive parser cases:
  - `/today hello` → ok, today
  - `/yesterday hello` → ok, today − 1
  - `/21-06-26 hello` → ok, 2026-06-21
  - `/21-06-2026 hello` → ok, 2026-06-21
  - `/21-06-26` (empty body) → error empty
  - `/32-13-26 hello` → error unparseable
  - `/21-06-30 hello` (future, with `now = 2026-05-04T...`) → error future
  - `/badcommand hello` → error unparseable
  - `hello` (no slash) → none
- **`lib/istDate.test.ts`** — extend with `istDayForYMD(2026, 6, 21)` boundary check.
- Webhook route is I/O glue; rely on manual end-to-end verification (DM the bot, check the Browse tab).

## Out of scope
- Sticky / stateful date selection (rejected in favor of one-shot per design)
- Slash-separated dates (`/21/06/26`)
- Other locale formats (mm-dd-yy)
- Inline replace of an existing day's story
