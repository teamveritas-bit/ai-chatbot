"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Message as ChatMessage } from "@/types/chat";

type MessageProps = {
  message: ChatMessage;
  onRegenerate?: () => void;
};

export function Message({ message, onRegenerate }: MessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard access may be unavailable in some browsers.
    }
  };

  return (
    <article
      className={`group flex w-full gap-3 px-4 py-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          aria-hidden="true"
        >
          <SparkIcon />
        </div>
      )}

      <div className="max-w-[min(100%,42rem)]">
        <div
          className={`break-words text-[15px] leading-7 ${
            isUser
              ? "whitespace-pre-wrap rounded-3xl bg-zinc-900 px-4 py-2.5 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "pt-1 text-zinc-800 dark:text-zinc-100"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <div className="prose prose-zinc max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.content && (
          <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy response"}
              title={copied ? "Copied" : "Copy response"}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>

            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                aria-label="Regenerate response"
                title="Regenerate response"
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <RegenerateIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.5 13.7 8.3 19.5 10 13.7 11.7 12 17.5 10.3 11.7 4.5 10 10.3 8.3 12 2.5Zm6.5 11.2 1 3.3 3.3 1-3.3 1-1 3.3-1-3.3-3.3-1 3.3-1 1-3.3Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function RegenerateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11a8 8 0 0 0-14.9-4L3 10" />
      <path d="M3 5v5h5" />
      <path d="M4 13a8 8 0 0 0 14.9 4L21 14" />
      <path d="M21 19v-5h-5" />
    </svg>
  );
}