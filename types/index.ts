export interface StoryType {
  _id: string;
  date: string;
  content: string;
  createdAt: string;
}

export type TabId = "write" | "browse" | "ai" | "export";
