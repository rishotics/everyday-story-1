"use client";

export default function Header() {
  return (
    <header className="relative overflow-hidden film-grain">
      {/* Terracotta top bar */}
      <div className="h-2 bg-terracotta" />

      {/* Aura blobs */}
      <div className="aura-blob-terracotta -top-20 -right-20 animate-float" />
      <div className="aura-blob-amber top-10 left-[20%] animate-float-slow" />

      <div className="dot-grid">
        <div className="max-w-5xl mx-auto px-8 pt-16 pb-10 relative">
          {/* Rotated sidebar text */}
          <div className="absolute left-2 top-8 hidden lg:block">
            <span className="sidebar-text">Vol. 01 — Daily Journal</span>
          </div>

          {/* Main title — dramatic scale */}
          <div className="relative z-10">
            <p className="metadata mb-3">
              ✦ est. {new Date().getFullYear()}
            </p>
            <h1 className="font-display text-8xl md:text-[10rem] lg:text-[12rem] text-forest leading-[0.85] tracking-tight">
              EVERYDAY
              <br />
              <span className="text-terracotta">STORY</span>
            </h1>
            <div className="mt-6 flex items-center gap-4">
              <div className="h-[2px] w-16 bg-terracotta" />
              <p className="font-story italic text-olive text-lg">
                Become a better storyteller, one day at a time
              </p>
            </div>
          </div>

          {/* Scattered metadata — editorial edges */}
          <div className="absolute right-8 bottom-4 hidden md:block">
            <p className="metadata text-right">
              A personal journal
              <br />
              for the art of storytelling
            </p>
          </div>
        </div>
      </div>

      {/* Bottom rule with star */}
      <div className="flex items-center gap-3 px-8 max-w-5xl mx-auto">
        <hr className="rule-line flex-1" />
        <span className="text-terracotta text-xs">✦</span>
        <hr className="rule-line flex-1" />
      </div>
    </header>
  );
}
