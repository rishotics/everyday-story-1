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

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[2px] w-8 bg-terracotta" />
        <span className="label text-olive">Browse Stories</span>
      </div>

      <div className="mb-8">
        <label className="label text-forest block mb-2">Filter by date</label>
        <div className="flex gap-3">
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

      {loading ? (
        <p className="text-olive font-medium">Loading stories...</p>
      ) : stories.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-4xl text-sand">No Stories Yet</p>
          <p className="text-olive mt-2">
            Head to the Write tab and capture your first story.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateStories]) => (
            <div key={date}>
              <h3 className="font-display text-3xl text-forest mb-4">
                {date}
              </h3>
              <div className="space-y-4">
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
