"use client";

import { useState } from "react";

interface ScoreFeedback {
  score: number;
  headline: string;
  feedback: string;
  rewrite?: string;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const color =
    score >= 8 ? "#8B9A6E" : score >= 5 ? "#C4603A" : "#0D0D0D";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#E8DCC8"
          strokeWidth="5"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl leading-none" style={{ color }}>
          {score}
        </span>
        <span className="metadata text-[0.55rem] mt-0.5">/ 10</span>
      </div>
    </div>
  );
}

export default function StoryEditor() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState<ScoreFeedback | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const storyText = content.trim();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, content: storyText }),
      });

      if (res.ok) {
        setContent("");
        setSaved(true);
        setTimeout(() => setSaved(false), 5000);

        setScoring(true);
        try {
          const scoreRes = await fetch("/api/ai/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: storyText }),
          });
          if (scoreRes.ok) {
            const data = await scoreRes.json();
            setFeedback(data);
          }
        } finally {
          setScoring(false);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  function dismissFeedback() {
    setFeedback(null);
  }

  return (
    <div>
      <div className="story-card rounded-sm film-grain">
        {/* Section header with number */}
        <div className="flex items-start gap-5 mb-8">
          <span className="section-number hidden sm:block">01</span>
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-terracotta text-[0.5rem]">✦</span>
              <span className="label text-olive">Today&apos;s Story</span>
            </div>
            <p className="metadata">
              Capture the moment. Make it vivid.
            </p>
          </div>
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

          <div className="mb-6 relative">
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
            {/* Character count metadata */}
            <span className="metadata absolute bottom-3 right-3 text-sand">
              {content.length} chars
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving || scoring || !content.trim()}
              className="bg-terracotta text-cream px-8 py-3 rounded-sm font-bold uppercase tracking-wider text-sm hover:bg-terracotta-light transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Story"}
            </button>

            {saved && !scoring && !feedback && (
              <span className="text-olive font-medium animate-fade-in-up">
                ✦ Story saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* AI Scoring — loading state */}
      {scoring && (
        <div className="mt-6 story-card rounded-sm border-t-olive animate-fade-in-up" style={{ borderTopColor: "#8B9A6E" }}>
          <div className="flex items-center gap-4">
            <span className="text-terracotta text-[0.5rem]">✦</span>
            <span className="label text-olive">Scoring your story...</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-olive border-t-transparent rounded-full animate-spin" />
            <p className="metadata">
              Your storytelling coach is reading...
            </p>
          </div>
        </div>
      )}

      {/* AI Scoring — feedback card */}
      {feedback && (
        <div className="mt-6 story-card rounded-sm relative animate-fade-in-up overflow-hidden">
          {/* Subtle aura behind score */}
          <div className="aura-blob-olive -top-16 -left-16" />

          <button
            onClick={dismissFeedback}
            className="absolute top-4 right-4 label text-sand hover:text-terracotta transition-colors cursor-pointer z-10"
          >
            Dismiss
          </button>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-terracotta text-[0.5rem]">✦</span>
            <span className="label text-olive">Story Coach</span>
            <span className="metadata ml-auto mr-16">AI Feedback</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10">
            {/* Score ring */}
            <div className="flex-shrink-0 text-center">
              <ScoreRing score={feedback.score} />
            </div>

            {/* Feedback content — dramatic type contrast */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-3xl sm:text-4xl text-forest leading-[0.95] mb-1">
                {feedback.headline}
              </h3>
              <div className="h-[2px] w-10 bg-terracotta mt-2 mb-4" />

              <p className="font-body text-sm text-forest leading-relaxed mb-5">
                {feedback.feedback}
              </p>

              {feedback.rewrite && (
                <div className="bg-cream stripe-accent px-5 py-4 rounded-sm">
                  <p className="label text-olive mb-2">
                    <span className="text-terracotta text-[0.5rem] mr-1">✦</span>
                    Try this instead
                  </p>
                  <p className="font-story text-base text-forest italic leading-relaxed">
                    &ldquo;{feedback.rewrite}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
