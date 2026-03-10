"use client";

import { TabId } from "@/types";

const tabs: { id: TabId; label: string }[] = [
  { id: "write", label: "Write" },
  { id: "browse", label: "Browse" },
  { id: "ai", label: "AI Chat" },
  { id: "export", label: "Export" },
];

export default function TabNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="flex gap-1 border-b-2 border-sand">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`label px-6 py-4 transition-colors cursor-pointer ${
            activeTab === tab.id
              ? "text-terracotta border-b-4 border-terracotta -mb-[2px] font-bold"
              : "text-olive hover:text-forest"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
