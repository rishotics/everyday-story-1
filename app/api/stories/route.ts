import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Story from "@/models/Story";

export async function GET(request: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  if (dateParam) {
    const start = new Date(dateParam + "T00:00:00.000Z");
    const end = new Date(dateParam + "T23:59:59.999Z");
    const stories = await Story.find({
      date: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });
    return NextResponse.json(stories);
  }

  const stories = await Story.find().sort({ date: -1, createdAt: -1 });
  return NextResponse.json(stories);
}

export async function POST(request: NextRequest) {
  await connectDB();

  const body = await request.json();
  const { date, content } = body;

  if (!date || !content) {
    return NextResponse.json(
      { error: "Date and content are required" },
      { status: 400 }
    );
  }

  const story = await Story.create({
    date: new Date(date + "T00:00:00.000Z"),
    content,
  });

  return NextResponse.json(story, { status: 201 });
}
