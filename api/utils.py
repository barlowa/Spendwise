from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


# get an environment variable
def env_var(key: str) -> str:

    if key is None:
        raise TypeError(f"Key must be provided")
    value = os.getenv(key)

    if value is None:
        raise ValueError(f"Environment variable not set for {key!r}")
    return value
