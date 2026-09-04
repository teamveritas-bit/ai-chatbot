from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


def load_env_file() -> None:
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(env_path)


def get_openrouter_api_key() -> str:
    return os.getenv("OPENROUTER_API_KEY", "").strip()


def get_openrouter_model() -> str:
    return os.getenv("OPENROUTER_MODEL", "").strip()
