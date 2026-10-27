import os
from pathlib import Path

from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)


def env_var(key: str) -> str:
    value = os.getenv(key)

    if value is None:
        raise ValueError(f"Environment variable not set for {key!r}")

    return value
