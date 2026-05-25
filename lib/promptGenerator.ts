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

    const text =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";
    return text || randomFallback(slot);
  } catch (err) {
    console.error("generatePrompt failed, using fallback:", err);
    return randomFallback(slot);
  }
}
