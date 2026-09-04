from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import load_env_file
from app.services.openrouter import OpenRouterError, stream_chat_completion

load_env_file()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)


class ChatResponse(BaseModel):
    response: str


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat")
async def chat(payload: ChatRequest) -> StreamingResponse:
    async def generate():
        try:
            async for chunk in stream_chat_completion(payload.message):
                yield chunk
        except OpenRouterError as exc:
            yield f"\n[ERROR] {exc.message}"

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
    )