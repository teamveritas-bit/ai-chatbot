"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

type MessageInputProps = {
  onSend: (content: string) => void;
  onStop?: () => void;
  disabled?: boolean;
};

export function MessageInput({
  onSend,
  onStop,
  disabled = false,
}: MessageInputProps) {
  const [value, setValue] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;

    if (!el) return;

    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const submit = () => {
    const content = value.trim();

    if (!content || disabled) return;

    onSend(content);
    setValue("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (disabled) {
      onStop?.();
      return;
    }

    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!disabled) {
        submit();
      }
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:px-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-3xl border border-zinc-200 bg-zinc-50 px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>

        <textarea
          id="chat-input"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message AI Chatbot..."
          className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-[15px] leading-6 text-zinc-900 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />

        {disabled ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            title="Stop generating"
            className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-opacity hover:opacity-80 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <StopIcon />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            title="Send message"
            className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <SendIcon />
          </button>
        )}
      </form>

      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-zinc-400">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3.4 11.2 19.2 3.6c.8-.4 1.6.4 1.2 1.2l-7.6 15.8c-.4.8-1.6.7-1.8-.2l-1.6-6.4-6.4-1.6c-.9-.2-1-1.4-.2-1.8Z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}