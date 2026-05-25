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
