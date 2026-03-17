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
    <div className="relative overflow-hidden">
      {/* Background aura */}
      <div className="aura-blob-amber -top-20 right-0 animate-float" />
      <div className="aura-blob-olive bottom-0 -left-20 animate-float-slow" />

      <div className="story-card rounded-sm py-16 film-grain">
        {/* Section header with number */}
        <div className="flex items-start gap-5 mb-12 justify-center">
          <span className="section-number">04</span>
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-terracotta text-[0.5rem]">✦</span>
              <span className="label text-olive">Export</span>
            </div>
            <p className="metadata">
              Download your storytelling journey
            </p>
          </div>
        </div>

        {/* Big number — dramatic scale */}
        <div className="text-center relative z-10 mb-10">
          <p className="font-display text-8xl md:text-[10rem] text-forest leading-none">
            {count !== null ? count : "—"}
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="h-[1px] w-8 bg-sand" />
            <p className="label text-olive">
              {count === 1 ? "Story" : "Stories"} Written
            </p>
            <div className="h-[1px] w-8 bg-sand" />
          </div>
        </div>

        <p className="text-olive max-w-sm mx-auto mb-10 text-sm leading-relaxed text-center">
          Download all your stories as a single Markdown file. Great for
          backup, printing, or sharing your storytelling journey.
        </p>

        <div className="text-center">
          <button
            onClick={handleDownload}
            disabled={downloading || count === 0}
            className="bg-forest text-cream px-10 py-4 rounded-sm font-bold uppercase tracking-wider text-sm hover:bg-forest-light transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {downloading ? "Preparing..." : "Download All Stories"}
          </button>
          <p className="metadata mt-3">
            Format: Markdown (.md)
          </p>
        </div>
      </div>
    </div>
  );
}
