import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { connectDB } from "@/lib/mongodb";
import Story from "@/models/Story";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  await connectDB();

  const { question } = await request.json();

  if (!question) {
    return NextResponse.json(
      { error: "Question is required" },
      { status: 400 }
    );
  }

  const stories = await Story.find()
    .sort({ date: -1 })
    .limit(50);

  const storiesContext = stories
    .map((s) => {
      const date = new Date(s.date).toISOString().split("T")[0];
      return `[${date}] ${s.content}`;
    })
    .join("\n\n");

  const systemPrompt = `You are a storytelling coach and journal companion. The user has been writing daily story highlights to become a better storyteller. Here are their recent stories:

${storiesContext || "(No stories yet)"}

Answer their question about these stories. Be specific — reference actual stories when relevant. Help them see patterns, improve their storytelling craft, and reflect on their experiences. Keep responses conversational and encouraging.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: question }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ answer: text });
}
