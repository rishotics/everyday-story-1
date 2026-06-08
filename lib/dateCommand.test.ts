import { describe, it, expect } from "vitest";
import { parseDateCommand } from "@/lib/dateCommand";

// 2026-05-04 12:00 UTC === 2026-05-04 17:30 IST
const now = new Date("2026-05-04T12:00:00.000Z");

describe("parseDateCommand", () => {
  it("treats text without a leading slash as no command", () => {
    expect(parseDateCommand("hello", now)).toEqual({ kind: "none" });
  });

  it("parses /today + text", () => {
    expect(parseDateCommand("/today hello world", now)).toEqual({
      kind: "ok",
      ymd: { y: 2026, m: 5, d: 4 },
      body: "hello world",
    });
  });

  it("parses /yesterday + text", () => {
    expect(parseDateCommand("/yesterday hi", now)).toEqual({
      kind: "ok",
      ymd: { y: 2026, m: 5, d: 3 },
      body: "hi",
    });
  });

  it("parses /dd-mm-yy + text", () => {
    expect(parseDateCommand("/21-04-26 walked in the rain", now)).toEqual({
      kind: "ok",
      ymd: { y: 2026, m: 4, d: 21 },
      body: "walked in the rain",
    });
  });

  it("parses /dd-mm-yyyy + text", () => {
    expect(parseDateCommand("/21-04-2026 ok", now)).toEqual({
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
    expect(parseDateCommand("/04-05-26 hi", now)).toEqual({
      kind: "ok",
      ymd: { y: 2026, m: 5, d: 4 },
      body: "hi",
    });
  });
});
