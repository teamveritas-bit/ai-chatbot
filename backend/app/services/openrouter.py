from __future__ import annotations

import json
from collections.abc import AsyncGenerator

import httpx

from app.config import get_openrouter_api_key, get_openrouter_model


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
REQUEST_TIMEOUT_SECONDS = 60.0


class OpenRouterError(Exception):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


async def stream_chat_completion(
    user_message: str,
) -> AsyncGenerator[str, None]:
    api_key = get_openrouter_api_key()
    model = get_openrouter_model()

    if not api_key:
        raise OpenRouterError(
            "The chatbot is not configured. Missing API key.",
            status_code=500,
        )

    if not model:
        raise OpenRouterError(
            "The chatbot is not configured. Missing model name.",
            status_code=500,
        )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Chatbot",
    }

    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": user_message,
            }
        ],
        "stream": True,
    }

    try:
        async with httpx.AsyncClient(
            timeout=REQUEST_TIMEOUT_SECONDS
        ) as client:
            async with client.stream(
                "POST",
                OPENROUTER_URL,
                headers=headers,
                json=payload,
            ) as response:

                if response.status_code in {401, 403}:
                    raise OpenRouterError(
                        "The AI service rejected the request. Check your API key.",
                        status_code=401,
                    )

                if response.status_code >= 400:
                    raise OpenRouterError(
                        "The AI service returned an error. Please try again.",
                        status_code=502,
                    )

                async for line in response.aiter_lines():
                    if not line:
                        continue

                    if not line.startswith("data:"):
                        continue

                    data = line[len("data:"):].strip()

                    if data == "[DONE]":
                        break

                    try:
                        chunk = json.loads(data)
                    except json.JSONDecodeError:
                        continue

                    content = _extract_stream_text(chunk)

                    if content:
                        yield content

    except httpx.TimeoutException as exc:
        raise OpenRouterError(
            "The AI service timed out. Please try again.",
            status_code=504,
        ) from exc

    except httpx.RequestError as exc:
        raise OpenRouterError(
            "Unable to reach the AI service. Please try again.",
            status_code=502,
        ) from exc


def _extract_stream_text(payload: object) -> str | None:
    if not isinstance(payload, dict):
        return None

    choices = payload.get("choices")

    if not isinstance(choices, list) or not choices:
        return None

    first_choice = choices[0]

    if not isinstance(first_choice, dict):
        return None

    delta = first_choice.get("delta")

    if not isinstance(delta, dict):
        return None

    content = delta.get("content")

    if not isinstance(content, str):
        return None

    return content