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
