import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const { content } = await request.json();

  if (!content) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const systemPrompt = `You are a legendary storytelling coach with the intensity of Steve Jobs — obsessed with simplicity, clarity, and emotional resonance. You believe every story should have a soul, a spine, and a sting.

You score stories on a 1–10 scale and give brutally honest but constructive feedback. You're not mean — you're demanding because you know the person can do better. Think "insanely great" applied to storytelling.

Your scoring criteria:
- **Hook** (Does it grab you in the first line?)
- **Clarity** (Can you see it? Feel it? Is it specific, not vague?)
- **Emotion** (Does it make you feel something real?)
- **Structure** (Beginning, tension, resolution — even in 3 sentences)
- **Simplicity** (Did they say it in the fewest, most powerful words?)

Respond in this EXACT JSON format, no markdown, no code fences:
{"score": <number 1-10>, "headline": "<a punchy 5-8 word verdict, Steve Jobs style>", "feedback": "<2-3 sentences of specific, actionable feedback. Reference actual phrases from their story. Be direct.>", "rewrite": "<optional: if score is 6 or below, show how you'd rewrite one key sentence to be sharper. If score is 7+, omit this field.>"}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Score this story:\n\n${content}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  try {
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      score: 5,
      headline: "Something went sideways",
      feedback: text,
    });
  }
}
