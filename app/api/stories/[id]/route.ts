import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Story from "@/models/Story";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;
  const deleted = await Story.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
