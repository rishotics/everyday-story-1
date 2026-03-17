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
      {/* Section header with number */}
      <div className="flex items-start gap-5 mb-8">
        <span className="section-number hidden sm:block">03</span>
        <div className="pt-2">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-terracotta text-[0.5rem]">✦</span>
            <span className="label text-olive">Story Coach</span>
          </div>
          <p className="metadata">
            AI-powered storytelling feedback
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="bg-white rounded-sm border-2 border-sand h-96 overflow-y-auto p-6 mb-6 space-y-4 relative"
      >
        {messages.length === 0 && (
          <div className="text-center py-16 relative">
            <div className="aura-blob-terracotta left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
            <p className="font-display text-4xl md:text-5xl text-sand mb-2 leading-tight relative z-10">
              Ask About
              <br />
              Your Stories
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-[1px] w-8 bg-sand" />
              <span className="text-terracotta text-[0.5rem]">✦</span>
              <div className="h-[1px] w-8 bg-sand" />
            </div>
            <p className="text-olive text-sm max-w-sm mx-auto relative z-10">
              Your AI coach knows all your stories. Ask about
              patterns, get feedback, or explore themes.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
          >
            <div
              className={`max-w-[80%] px-5 py-3 rounded-sm ${
                msg.role === "user"
                  ? "bg-terracotta text-cream"
                  : "bg-cream text-forest stripe-accent"
              }`}
            >
              {msg.role === "assistant" && (
                <span className="metadata block mb-1 text-olive">Coach</span>
              )}
              <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-cream text-olive px-5 py-3 rounded-sm stripe-accent flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-olive border-t-transparent rounded-full animate-spin" />
              <p className="metadata">Thinking...</p>
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
              className="bg-cream border-2 border-sand px-4 py-2 rounded-sm text-olive hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer text-xs font-medium"
            >
              <span className="text-terracotta text-[0.4rem] mr-1.5">✦</span>
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
