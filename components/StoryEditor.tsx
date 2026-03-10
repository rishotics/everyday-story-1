"use client";

import { useState } from "react";

export default function StoryEditor() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, content: content.trim() }),
      });

      if (res.ok) {
        setContent("");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="story-card rounded-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[2px] w-8 bg-terracotta" />
        <span className="label text-olive">Today&apos;s Story</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="label text-forest block mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-cream border-2 border-sand px-4 py-3 rounded-sm font-body text-forest w-full max-w-xs"
          />
        </div>

        <div className="mb-6">
          <label className="label text-forest block mb-2">
            What&apos;s the story?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell today's story..."
            rows={8}
            className="w-full bg-cream border-2 border-sand px-6 py-4 rounded-sm font-story text-lg text-forest leading-relaxed resize-y"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="bg-terracotta text-cream px-8 py-3 rounded-sm font-bold uppercase tracking-wider text-sm hover:bg-terracotta-light transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Story"}
          </button>

          {saved && (
            <span className="text-olive font-medium animate-pulse">
              Story saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
