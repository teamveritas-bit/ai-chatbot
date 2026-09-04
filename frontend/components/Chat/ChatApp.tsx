"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Chat } from "@/components/Chat/Chat";
import { MessageInput } from "@/components/Input/MessageInput";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { ChatApiError, streamChatMessage } from "@/lib/api/chat";

import type { Message, RecentChat } from "@/types/chat";

type SavedChat = {
  id: string;
  title: string;
  messages: Message[];
};

const STORAGE_KEY = "ai-chatbot-chats";

export function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // Load saved chats when the app starts.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const chats: SavedChat[] = JSON.parse(saved);

      setRecentChats(
        chats.map((chat) => ({
          id: chat.id,
          title: chat.title,
        })),
      );
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save the current conversation whenever messages change.
  useEffect(() => {
    if (!currentChatId || messages.length === 0) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const chats: SavedChat[] = saved ? JSON.parse(saved) : [];

      const firstUserMessage = messages.find(
        (message) => message.role === "user",
      );

      const title =
        firstUserMessage?.content.slice(0, 40) || "New Chat";

      const existingIndex = chats.findIndex(
        (chat: SavedChat) => chat.id === currentChatId,
      );

      const updatedChat: SavedChat = {
        id: currentChatId,
        title,
        messages,
      };

      if (existingIndex >= 0) {
        chats[existingIndex] = updatedChat;
      } else {
        chats.unshift(updatedChat);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));

      setRecentChats(
        chats.map((chat: SavedChat) => ({
          id: chat.id,
          title: chat.title,
        })),
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [messages, currentChatId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleNewChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    setMessages([]);
    setCurrentChatId(null);
    setIsResponding(false);
    setSidebarOpen(false);
  }, []);

  const handleOpenChat = useCallback((chatId: string) => {
    abortRef.current?.abort();
    abortRef.current = null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const chats: SavedChat[] = JSON.parse(saved);

      const chat = chats.find((item) => item.id === chatId);

      if (!chat) return;

      setMessages(chat.messages);
      setCurrentChatId(chat.id);
      setIsResponding(false);
      setSidebarOpen(false);
    } catch {
      // Ignore invalid localStorage data.
    }
  }, []);
  const handleRenameChat = useCallback(
  (chatId: string, title: string) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const chats: SavedChat[] = JSON.parse(saved);

      const updatedChats = chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title,
            }
          : chat,
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));

      setRecentChats(
        updatedChats.map((chat) => ({
          id: chat.id,
          title: chat.title,
        })),
      );
    } catch {
      // Ignore localStorage errors.
    }
  },
  [],
);

const handleDeleteChat = useCallback(
  (chatId: string) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const chats: SavedChat[] = JSON.parse(saved);

      const updatedChats = chats.filter(
        (chat) => chat.id !== chatId,
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedChats),
      );

      setRecentChats(
        updatedChats.map((chat) => ({
          id: chat.id,
          title: chat.title,
        })),
      );

      if (currentChatId === chatId) {
        abortRef.current?.abort();
        abortRef.current = null;

        setMessages([]);
        setCurrentChatId(null);
        setIsResponding(false);
      }
    } catch {
      // Ignore localStorage errors.
    }
  },
  [currentChatId],
);

  const handleStop = useCallback(() => {
    const controller = abortRef.current;

    if (!controller) return;

    controller.abort();
    abortRef.current = null;
    setIsResponding(false);
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      if (isResponding) return;

      const chatId = currentChatId ?? crypto.randomUUID();

      if (!currentChatId) {
        setCurrentChatId(chatId);
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      const assistantMessageId = crypto.randomUUID();

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };

      setMessages((previous) => [
        ...previous,
        userMessage,
        assistantMessage,
      ]);

      setIsResponding(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChatMessage(
          { message: content },
          (chunk) => {
            setMessages((previous) =>
              previous.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      content: message.content + chunk,
                    }
                  : message,
              ),
            );
          },
          controller.signal,
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        const errorText =
          error instanceof ChatApiError
            ? error.message
            : "Something went wrong. Please try again.";

        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: errorText,
                }
              : message,
          ),
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;

          if (!controller.signal.aborted) {
            setIsResponding(false);
          }
        }
      }
    },
    [currentChatId, isResponding],
  );

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      if (isResponding) return;

      const messageIndex = messages.findIndex(
        (message) => message.id === messageId,
      );

      if (messageIndex <= 0) return;

      const previousMessage = messages[messageIndex - 1];

      if (previousMessage.role !== "user") return;

      const controller = new AbortController();
      abortRef.current = controller;

      setIsResponding(true);

      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: "",
              }
            : message,
        ),
      );

      try {
        await streamChatMessage(
          { message: previousMessage.content },
          (chunk) => {
            setMessages((previous) =>
              previous.map((message) =>
                message.id === messageId
                  ? {
                      ...message,
                      content: message.content + chunk,
                    }
                  : message,
              ),
            );
          },
          controller.signal,
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        const errorText =
          error instanceof ChatApiError
            ? error.message
            : "Something went wrong. Please try again.";

        setMessages((previous) =>
          previous.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  content: errorText,
                }
              : message,
          ),
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;

          if (!controller.signal.aborted) {
            setIsResponding(false);
          }
        }
      }
    },
    [isResponding, messages],
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar
  open={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  onNewChat={handleNewChat}
  onOpenChat={handleOpenChat}
  onRenameChat={handleRenameChat}
  onDeleteChat={handleDeleteChat}
  recentChats={recentChats}
/>

      <div className="flex min-w-0 flex-1 flex-col">
        <Chat
          messages={messages}
          isResponding={isResponding}
          onOpenSidebar={() => setSidebarOpen(true)}
          onRegenerate={handleRegenerate}
        />

        <MessageInput
          onSend={handleSend}
          onStop={handleStop}
          disabled={isResponding}
        />
      </div>
    </div>
  );
}