import type { ChatRequest } from "@/types/chat";

const API_BASE_URL = "https://ai-chatbot-backend-u62x.onrender.com";

export class ChatApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatApiError";
  }
}

export async function streamChatMessage(
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ChatApiError(
      "Unable to reach the server. Make sure the FastAPI backend is running.",
    );
  }

  if (!response.ok) {
    throw new ChatApiError(await readApiErrorMessage(response));
  }

  if (!response.body) {
    throw new ChatApiError("The server returned an empty response.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });

      if (chunk) {
        onChunk(chunk);
      }
    }

    const finalChunk = decoder.decode();

    if (finalChunk) {
      onChunk(finalChunk);
    }
  } finally {
    reader.releaseLock();
  }
}

async function readApiErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof data.detail === "string"
    ) {
      return data.detail;
    }
  } catch {
    // Fall through to the generic message.
  }

  return "The server returned an error. Please try again.";
}