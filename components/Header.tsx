"use client";

export default function Header() {
  return (
    <header className="relative">
      {/* Terracotta top bar */}
      <div className="h-2 bg-terracotta" />

      <div className="dot-grid">
        <div className="max-w-4xl mx-auto px-8 pt-12 pb-8">
          <h1 className="font-display text-7xl md:text-9xl text-forest leading-none tracking-tight">
            EVERYDAY STORY
          </h1>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-[2px] w-12 bg-terracotta" />
            <p className="label text-olive">
              A daily storytelling journal
            </p>
          </div>
        </div>
      </div>

      {/* Bottom rule */}
      <hr className="rule-line" />
    </header>
  );
}
