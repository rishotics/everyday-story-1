import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Story from "@/models/Story";
import { sendMessage } from "@/lib/telegram";
import { istDayForYMD, istDayRange, istMidnightUTC } from "@/lib/istDate";
import { parseDateCommand } from "@/lib/dateCommand";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const pad2 = (n: number) => String(n).padStart(2, "0");

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
      label = `${pad2(parsed.ymd.d)} ${MONTHS[parsed.ymd.m - 1]} ${parsed.ymd.y}`;
    } else {
      const now = new Date();
      const { start, end } = istDayRange(now);
      target = { start, end, anchor: istMidnightUTC(now) };
      body = message.text;
      label = null;
    }

    const existing = await Story.findOne({
      date: { $gte: target.start, $lte: target.end },
    });

    if (existing) {
      existing.content = `${existing.content}\n\n${body}`;
      await existing.save();
    } else {
      await Story.create({ date: target.anchor, content: body });
    }

    await sendMessage(chatId, label ? `Saved ✓ (${label})` : "Saved ✓");
  } catch (err) {
    console.error("webhook handler failed:", err);
  }

  return NextResponse.json({ ok: true });
}
