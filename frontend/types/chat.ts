export type MessageRole = "user" | "assistant";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
};

export type RecentChat = {
  id: string;
  title: string;
};

export type ChatRequest = {
  message: string;
};

export type ChatResponse = {
  response: string;
};
