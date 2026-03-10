"use client";

import { StoryType } from "@/types";

export default function StoryCard({
  story,
  onDelete,
}: {
  story: StoryType;
  onDelete: (id: string) => void;
}) {
  const dateStr = new Date(story.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function handleDelete() {
    if (window.confirm("Delete this story?")) {
      onDelete(story._id);
    }
  }

  return (
    <div className="story-card rounded-sm relative group">
      <div className="flex items-center justify-between mb-4">
        <span className="label text-olive">{dateStr}</span>
        <button
          onClick={handleDelete}
          className="label text-sand hover:text-terracotta transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          Delete
        </button>
      </div>
      <p className="font-story text-lg text-forest leading-relaxed whitespace-pre-wrap">
        {story.content}
      </p>
    </div>
  );
}
