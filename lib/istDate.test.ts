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
