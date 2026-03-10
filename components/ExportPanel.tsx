"use client";

import { useState, useEffect } from "react";

export default function ExportPanel() {
  const [count, setCount] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => setCount(data.length));
  }, []);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/stories/export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "everyday-stories.md";
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="story-card rounded-sm text-center py-12">
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-[2px] w-8 bg-terracotta" />
        <span className="label text-olive">Export</span>
        <div className="h-[2px] w-8 bg-terracotta" />
      </div>

      <p className="font-display text-5xl text-forest mb-2">
        {count !== null ? count : "—"}
      </p>
      <p className="label text-olive mb-8">
        {count === 1 ? "Story" : "Stories"} Written
      </p>

      <p className="text-olive max-w-md mx-auto mb-8 text-sm leading-relaxed">
        Download all your stories as a single Markdown file. Great for
        backup, printing, or sharing your storytelling journey.
      </p>

      <button
        onClick={handleDownload}
        disabled={downloading || count === 0}
        className="bg-forest text-cream px-8 py-3 rounded-sm font-bold uppercase tracking-wider text-sm hover:bg-forest-light transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {downloading ? "Preparing..." : "Download All Stories"}
      </button>
    </div>
  );
}
