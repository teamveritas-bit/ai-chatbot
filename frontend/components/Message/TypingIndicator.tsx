export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        aria-hidden="true"
      >
        <SparkIcon />
      </div>
      <div
        className="flex h-8 items-center gap-1 rounded-2xl bg-zinc-100 px-3 dark:bg-zinc-800/80"
        role="status"
        aria-label="Assistant is typing"
      >
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s] dark:bg-zinc-400" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s] dark:bg-zinc-400" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 dark:bg-zinc-400" />
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5 13.7 8.3 19.5 10 13.7 11.7 12 17.5 10.3 11.7 4.5 10 10.3 8.3 12 2.5Zm6.5 11.2 1 3.3 3.3 1-3.3 1-1 3.3-1-3.3-3.3-1 3.3-1 1-3.3Z" />
    </svg>
  );
}
