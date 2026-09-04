"use client";

import { useState } from "react";

import type { RecentChat } from "@/types/chat";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onOpenChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
  onDeleteChat: (chatId: string) => void;
  recentChats: RecentChat[];
};

export function Sidebar({
  open,
  onClose,
  onNewChat,
  onOpenChat,
  onRenameChat,
  onDeleteChat,
  recentChats,
}: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const startRename = (chat: RecentChat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
    setMenuOpen(null);
  };

  const saveRename = () => {
    if (!editingChatId) return;

    const title = editingTitle.trim();

    if (title) {
      onRenameChat(editingChatId, title);
    }

    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleDelete = (chatId: string) => {
    setMenuOpen(null);

    const confirmed = window.confirm(
      "Are you sure you want to delete this chat?",
    );

    if (confirmed) {
      onDeleteChat(chatId);
    }
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
       className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-zinc-950 text-zinc-100 transition-transform duration-200 md:static md:z-0 md:translate-x-0 ${
  open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
}`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
              <SparkIcon />
            </span>

            <h1 className="text-sm font-semibold tracking-tight">
              AI Chatbot
            </h1>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 md:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-3">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
          >
            <PlusIcon />
            New Chat
          </button>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col px-3">
          <h2 className="px-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Recent Chats
          </h2>

          <nav className="mt-2 space-y-1 overflow-y-auto pb-4">
            {recentChats.length === 0 ? (
              <p className="px-2 py-3 text-sm text-zinc-500">
                No conversations yet.
              </p>
            ) : (
              recentChats.map((chat) => (
                <div key={chat.id} className="relative">
                  {editingChatId === chat.id ? (
                    <div className="flex gap-1 px-1">
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            saveRename();
                          }

                          if (event.key === "Escape") {
                            setEditingChatId(null);
                            setEditingTitle("");
                          }
                        }}
                        className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                      />

                      <button
                        type="button"
                        onClick={saveRename}
                        className="rounded-md px-2 text-xs text-zinc-300 hover:bg-zinc-800"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenChat(chat.id)}
                        className="flex w-full truncate rounded-lg px-3 py-2 pr-10 text-left text-sm text-zinc-300 hover:bg-zinc-900"
                      >
                        {chat.title}
                      </button>

                      <button
                        type="button"
                        aria-label={`Options for ${chat.title}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuOpen((current) =>
                            current === chat.id ? null : chat.id,
                          );
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                      >
                        <MoreIcon />
                      </button>

                      {menuOpen === chat.id && (
                        <div className="absolute right-1 top-10 z-50 w-32 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
                          <button
                            type="button"
                            onClick={() => startRename(chat)}
                            className="block w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                          >
                            Rename
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(chat.id)}
                            className="block w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-800"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </nav>
        </div>
      </aside>
    </>
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

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}