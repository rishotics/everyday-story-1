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
