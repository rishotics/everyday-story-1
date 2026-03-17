"use client";

import { useState, useEffect, useCallback } from "react";
import { StoryType } from "@/types";
import StoryCard from "./StoryCard";

export default function StoryBrowser() {
  const [stories, setStories] = useState<StoryType[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    const url = filterDate
      ? `/api/stories?date=${filterDate}`
      : "/api/stories";
    const res = await fetch(url);
    const data = await res.json();
    setStories(data);
    setLoading(false);
  }, [filterDate]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStories((prev) => prev.filter((s) => s._id !== id));
    }
  }

  // Group stories by date
  const grouped: Record<string, StoryType[]> = {};
  for (const story of stories) {
    const key = new Date(story.date).toISOString().split("T")[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(story);
  }

  const dateEntries = Object.entries(grouped);

  return (
    <div>
      {/* Section header with number */}
      <div className="flex items-start gap-5 mb-8">
        <span className="section-number hidden sm:block">02</span>
        <div className="pt-2">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-terracotta text-[0.5rem]">✦</span>
            <span className="label text-olive">Browse Stories</span>
          </div>
          <p className="metadata">
            {stories.length} {stories.length === 1 ? "story" : "stories"} across{" "}
            {dateEntries.length} {dateEntries.length === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-8">
        <label className="label text-forest block mb-2">Filter by date</label>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-cream border-2 border-sand px-4 py-3 rounded-sm font-body text-forest max-w-xs"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="label text-olive hover:text-terracotta transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stories */}
      {loading ? (
        <div className="flex items-center gap-3 py-12">
          <div className="w-4 h-4 border-2 border-olive border-t-transparent rounded-full animate-spin" />
          <p className="metadata">Loading stories...</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 relative overflow-hidden">
          <div className="aura-blob-amber left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <p className="font-display text-5xl md:text-6xl text-sand leading-tight relative z-10">
            No Stories
            <br />
            Yet
          </p>
          <div className="h-[2px] w-10 bg-sand mx-auto mt-4 mb-3" />
          <p className="text-olive text-sm relative z-10">
            Head to the Write tab and capture your first story.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {dateEntries.map(([date, dateStories], i) => (
            <div key={date} className="animate-fade-in-up">
              {/* Date group header — editorial with index */}
              <div className="flex items-baseline gap-4 mb-4">
                <span className="metadata text-sand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-3xl md:text-4xl text-forest">
                  {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                <span className="metadata">{date}</span>
                <div className="h-[1px] flex-1 bg-sand" />
              </div>

              <div className="space-y-4 ml-0 sm:ml-10">
                {dateStories.map((story) => (
                  <StoryCard
                    key={story._id}
                    story={story}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
