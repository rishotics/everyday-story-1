"use client";

import { TabId } from "@/types";

const tabs: { id: TabId; num: string; label: string }[] = [
  { id: "write", num: "01", label: "Write" },
  { id: "browse", num: "02", label: "Browse" },
  { id: "ai", num: "03", label: "AI Chat" },
  { id: "export", num: "04", label: "Export" },
];

export default function TabNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="flex gap-0 border-b-2 border-sand">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`group flex items-baseline gap-2 px-5 md:px-6 py-4 transition-all cursor-pointer ${
            activeTab === tab.id
              ? "border-b-[3px] border-terracotta -mb-[2px]"
              : "hover:bg-sand/30"
          }`}
        >
          <span
            className={`metadata text-[0.6rem] transition-colors ${
              activeTab === tab.id ? "text-terracotta" : "text-sand group-hover:text-olive"
            }`}
          >
            {tab.num}
          </span>
          <span
            className={`label transition-colors ${
              activeTab === tab.id
                ? "text-terracotta font-bold"
                : "text-olive group-hover:text-forest"
            }`}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
