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
    <main className="min-h-screen">
      <Header />

      <div className="max-w-4xl mx-auto px-8 py-12">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-10">
          {activeTab === "write" && <StoryEditor />}
          {activeTab === "browse" && <StoryBrowser />}
          {activeTab === "ai" && <AiChat />}
          {activeTab === "export" && <ExportPanel />}
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-8 py-8">
        <hr className="rule-line mb-6" />
        <p className="label text-sand text-center">
          Everyday Story — Become a better storyteller, one day at a time.
        </p>
      </footer>
    </main>
  );
}
