"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/components/Message/Message";
import { TypingIndicator } from "@/components/Message/TypingIndicator";
import type { Message as ChatMessage } from "@/types/chat";

type ChatProps = {
  messages: ChatMessage[];
  isResponding: boolean;
  onOpenSidebar: () => void;
  onRegenerate: (messageId: string) => void;
};

export function Chat({
  messages,
  isResponding,
  onOpenSidebar,
  onRegenerate,
}: ChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isResponding]);

  const isEmpty = messages.length === 0 && !isResponding;

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-950">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 px-3 dark:border-zinc-800 md:px-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 md:hidden"
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </button>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Chat</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen />
        ) : (
          <div className="mx-auto w-full max-w-3xl py-4">
            {messages.map((message) => (
              <Message
  key={message.id}
  message={message}
  onRegenerate={() => onRegenerate(message.id)}
/>
            ))}
            {isResponding && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </section>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
        <SparkIcon />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        How can I help you today?
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        Start a conversation below. This UI is running with simulated replies
        until the AI API is connected.
      </p>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5 13.7 8.3 19.5 10 13.7 11.7 12 17.5 10.3 11.7 4.5 10 10.3 8.3 12 2.5Zm6.5 11.2 1 3.3 3.3 1-3.3 1-1 3.3-1-3.3-3.3-1 3.3-1 1-3.3Z" />
    </svg>
  );
}
