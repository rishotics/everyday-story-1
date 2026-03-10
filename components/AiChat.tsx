"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const suggestions = [
  "What patterns do you see in my stories?",
  "How can I improve my storytelling?",
  "Summarize my recent stories",
  "What themes keep coming up?",
];

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text.trim() }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer || "Something went wrong." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Failed to get a response. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[2px] w-8 bg-terracotta" />
        <span className="label text-olive">Story Coach</span>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="bg-white rounded-sm border-2 border-sand h-96 overflow-y-auto p-6 mb-6 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="font-display text-3xl text-sand mb-4">
              Ask About Your Stories
            </p>
            <p className="text-olive text-sm max-w-md mx-auto">
              Your AI storytelling coach knows all your stories. Ask about
              patterns, get feedback, or explore themes.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-5 py-3 rounded-sm ${
                msg.role === "user"
                  ? "bg-terracotta text-cream"
                  : "bg-cream text-forest stripe-accent"
              }`}
            >
              <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-cream text-olive px-5 py-3 rounded-sm stripe-accent">
              <p className="font-body text-sm animate-pulse">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="label bg-cream border-2 border-sand px-4 py-2 rounded-sm text-olive hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer text-xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your stories..."
          className="flex-1 bg-white border-2 border-sand px-5 py-3 rounded-sm font-body text-forest"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-terracotta text-cream px-6 py-3 rounded-sm font-bold uppercase tracking-wider text-sm hover:bg-terracotta-light transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
