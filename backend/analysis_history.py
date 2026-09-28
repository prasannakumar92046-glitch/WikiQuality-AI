from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DB_PATH = Path(__file__).resolve().parent / "wikiquality_history.db"


def _get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_history_database() -> None:
    with _get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS analysis_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                source_type TEXT NOT NULL,
                source_url TEXT DEFAULT '',
                article_text TEXT NOT NULL,
                analysis_result TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id "
            "ON analysis_history(user_id)"
        )
        connection.commit()


def _summary_from_result(result: dict[str, Any]) -> dict[str, int]:
    quality = result.get("quality_analysis") or {}
    summary = quality.get("summary") or {}
    findings = quality.get("findings") or []
    strengths = quality.get("strengths") or []

    return {
        "total_findings": int(summary.get("total_findings", len(findings)) or 0),
        "high_findings": int(summary.get("high_findings", 0) or 0),
        "medium_findings": int(summary.get("medium_findings", 0) or 0),
        "total_strengths": int(
            summary.get("total_strengths", len(strengths)) or 0
        ),
    }


def save_analysis(
    *,
    user_id: str,
    title: str,
    source_type: str,
    source_url: str,
    article_text: str,
    analysis_result: dict[str, Any],
) -> int:
    now = datetime.now(timezone.utc).isoformat()

    with _get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO analysis_history (
                user_id,
                title,
                source_type,
                source_url,
                article_text,
                analysis_result,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(user_id),
                title.strip() or "Untitled analysis",
                source_type.strip() or "pasted_text",
                source_url.strip(),
                article_text,
                json.dumps(analysis_result, ensure_ascii=False),
                now,
            ),
        )
        connection.commit()
        return int(cursor.lastrowid)


def list_analyses(*, user_id: str, limit: int = 50) -> list[dict[str, Any]]:
    safe_limit = max(1, min(int(limit), 100))

    with _get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, title, source_type, source_url, article_text,
                   analysis_result, created_at
            FROM analysis_history
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (str(user_id), safe_limit),
        ).fetchall()

    result = []

    for row in rows:
        try:
            analysis_result = json.loads(row["analysis_result"])
        except (TypeError, json.JSONDecodeError):
            analysis_result = {}

        summary = _summary_from_result(analysis_result)
        word_count = (
            ((analysis_result.get("nlp_analysis") or {}).get("word_count"))
            or ((analysis_result.get("structure_analysis") or {}).get("statistics") or {}).get("word_count")
            or len((row["article_text"] or "").split())
        )

        result.append(
            {
                "id": row["id"],
                "title": row["title"],
                "source_type": row["source_type"],
                "source_url": row["source_url"],
                "created_at": row["created_at"],
                "word_count": int(word_count or 0),
                **summary,
            }
        )

    return result


def get_analysis(*, user_id: str, analysis_id: int) -> dict[str, Any] | None:
    with _get_connection() as connection:
        row = connection.execute(
            """
            SELECT id, title, source_type, source_url, article_text,
                   analysis_result, created_at
            FROM analysis_history
            WHERE id = ? AND user_id = ?
            """,
            (int(analysis_id), str(user_id)),
        ).fetchone()

    if row is None:
        return None

    try:
        analysis_result = json.loads(row["analysis_result"])
    except (TypeError, json.JSONDecodeError):
        analysis_result = {}

    return {
        "id": row["id"],
        "title": row["title"],
        "source_type": row["source_type"],
        "source_url": row["source_url"],
        "article_text": row["article_text"],
        "analysis_result": analysis_result,
        "created_at": row["created_at"],
        "summary": _summary_from_result(analysis_result),
    }
