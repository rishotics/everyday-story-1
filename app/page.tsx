"use client";

import { useState } from "react";
import { TabId } from "@/types";
import Header from "@/components/Header";
import TabNav from "@/components/TabNav";
import StoryEditor from "@/components/StoryEditor";
import StoryBrowser from "@/components/StoryBrowser";
import AiChat from "@/components/AiChat";
import ExportPanel from "@/components/ExportPanel";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("write");

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Global aura blobs — floating ambient warmth */}
      <div className="aura-blob-terracotta fixed -top-40 -right-40 animate-float opacity-50" />
      <div className="aura-blob-amber fixed bottom-20 -left-32 animate-float-slow opacity-40" />

      <Header />

      <div className="max-w-5xl mx-auto px-8 py-12 relative z-10">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-10">
          {activeTab === "write" && <StoryEditor />}
          {activeTab === "browse" && <StoryBrowser />}
          {activeTab === "ai" && <AiChat />}
          {activeTab === "export" && <ExportPanel />}
        </div>
      </div>

      {/* Footer — editorial bottom bar */}
      <footer className="max-w-5xl mx-auto px-8 py-8 relative z-10">
        <div className="flex items-center gap-3">
          <hr className="rule-line flex-1" />
          <span className="text-terracotta text-xs">✦</span>
          <hr className="rule-line flex-1" />
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="metadata">
            Everyday Story
          </p>
          <p className="font-story italic text-sand text-sm">
            One day at a time
          </p>
          <p className="metadata">
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}
