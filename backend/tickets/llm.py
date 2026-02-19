import json
import os
from typing import Any, Dict

import requests

from .models import Ticket
from .prompts import SYSTEM_PROMPT


FALLBACK_CATEGORY = Ticket.Category.GENERAL
FALLBACK_PRIORITY = Ticket.Priority.MEDIUM


def _fallback() -> Dict[str, str]:
    return {
        "suggested_category": FALLBACK_CATEGORY,
        "suggested_priority": FALLBACK_PRIORITY,
    }


def _normalize_category(value: str | None) -> str:
    valid = {choice[0] for choice in Ticket.Category.choices}
    value = (value or "").strip().lower()
    return value if value in valid else FALLBACK_CATEGORY


def _normalize_priority(value: str | None) -> str:
    valid = {choice[0] for choice in Ticket.Priority.choices}
    value = (value or "").strip().lower()
    return value if value in valid else FALLBACK_PRIORITY


def classify_description(description: str) -> Dict[str, str]:
    if not description or not description.strip():
        return _fallback()

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

    if not api_key:
        return _fallback()

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "input": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": f"Ticket description:\n{description}",
            },
        ],
        "temperature": 0,
        "response_format": {"type": "json_object"},
    }

    try:
        response = requests.post(
            "https://api.openai.com/v1/responses",
            headers=headers,
            json=payload,
            timeout=10,
        )
        response.raise_for_status()

        data = response.json()

        # Responses API returns structured output differently
        raw_content = data["output"][0]["content"][0]["text"]

        parsed: Dict[str, Any] = json.loads(raw_content)

        return {
            "suggested_category": _normalize_category(parsed.get("category")),
            "suggested_priority": _normalize_priority(parsed.get("priority")),
        }

    except Exception:
        return _fallback()
