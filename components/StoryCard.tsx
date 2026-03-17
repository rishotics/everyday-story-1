"use client";

import { StoryType } from "@/types";

export default function StoryCard({
  story,
  onDelete,
}: {
  story: StoryType;
  onDelete: (id: string) => void;
}) {
  const d = new Date(story.date);
  const dateStr = d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = new Date(story.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  function handleDelete() {
    if (window.confirm("Delete this story?")) {
      onDelete(story._id);
    }
  }

  return (
    <div className="story-card rounded-sm relative group film-grain">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-terracotta text-[0.5rem]">✦</span>
          <span className="label text-olive">{dateStr}</span>
          <span className="metadata hidden sm:inline">{timeStr}</span>
        </div>
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
