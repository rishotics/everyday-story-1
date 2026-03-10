import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Story from "@/models/Story";

export async function GET() {
  await connectDB();

  const stories = await Story.find().sort({ date: 1, createdAt: 1 });

  let markdown = "# Everyday Story — My Journal\n\n";

  let currentDate = "";
  for (const story of stories) {
    const dateStr = new Date(story.date).toISOString().split("T")[0];
    if (dateStr !== currentDate) {
      currentDate = dateStr;
      markdown += `\n---\n\n## ${dateStr}\n\n`;
    }
    markdown += `${story.content}\n\n`;
  }

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="everyday-stories.md"',
    },
  });
}
