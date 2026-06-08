export type DateCommand =
  | { kind: "none" }
  | { kind: "ok"; ymd: { y: number; m: number; d: number }; body: string }
  | { kind: "error"; reason: "empty" | "future" | "unparseable" };

const NUMERIC = /^\/(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/;
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

function istYmd(instant: Date): { y: number; m: number; d: number } {
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

  const today = istYmd(now);
  let target: { y: number; m: number; d: number };

  if (head === "/today") {
    target = today;
  } else if (head === "/yesterday") {
    target = istYmd(new Date(now.getTime() - 86_400_000));
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

  const todayAnchor = Date.UTC(today.y, today.m - 1, today.d);
  const targetAnchor = Date.UTC(target.y, target.m - 1, target.d);
  if (targetAnchor > todayAnchor) return { kind: "error", reason: "future" };

  return { kind: "ok", ymd: target, body };
}
