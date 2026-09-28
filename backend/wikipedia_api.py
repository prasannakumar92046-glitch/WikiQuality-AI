import re
from urllib.parse import quote

import requests


WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/rest.php/v1"


def clean_wikitext(wikitext: str) -> str:
    """
    Convert basic Wikipedia wikitext into cleaner plain text.

    This is intentionally conservative. It removes common markup
    without pretending to fully parse every Wikipedia template.
    """

    text = wikitext

    # Remove comments
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.DOTALL)

    # Remove references such as <ref>...</ref>
    text = re.sub(
        r"<ref\b[^>]*>.*?</ref>",
        " ",
        text,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Remove self-closing reference tags
    text = re.sub(
        r"<ref\b[^>]*/>",
        " ",
        text,
        flags=re.IGNORECASE
    )

    # Remove templates
    text = re.sub(
        r"\{\{.*?\}\}",
        " ",
        text,
        flags=re.DOTALL
    )

    # Convert headings
    text = re.sub(
        r"={2,6}\s*(.*?)\s*={2,6}",
        r"\n\1\n",
        text
    )

    # Convert links [[Target|Display text]]
    text = re.sub(
        r"\[\[([^|\]]+)\|([^\]]+)\]\]",
        r"\2",
        text
    )

    # Convert simple links [[Target]]
    text = re.sub(
        r"\[\[([^\]]+)\]\]",
        r"\1",
        text
    )

    # Remove external link markup but keep label
    text = re.sub(
        r"\[https?://[^\s\]]+\s+([^\]]+)\]",
        r"\1",
        text
    )

    # Remove remaining URLs
    text = re.sub(
        r"https?://\S+",
        " ",
        text
    )

    # Remove bold/italic markup
    text = re.sub(r"'{2,5}", "", text)

    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)

    # Remove common list markers
    text = re.sub(r"(?m)^\s*[\*\#;:]+\s*", "", text)

    # Remove table syntax lines
    text = re.sub(r"(?m)^\s*\{\|.*?$", "", text)
    text = re.sub(r"(?m)^\s*\|\}.*?$", "", text)
    text = re.sub(r"(?m)^\s*[|!].*$", "", text)

    # Normalize whitespace
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    return text.strip()


def get_wikipedia_article(title: str) -> dict:
    """
    Retrieve a Wikipedia article using the MediaWiki REST API.
    """

    title = title.strip()

    if not title:
        return {
            "success": False,
            "message": "Wikipedia article title is required."
        }

    encoded_title = quote(title.replace(" ", "_"), safe="")

    url = f"{WIKIPEDIA_API_BASE}/page/{encoded_title}"

    headers = {
        "User-Agent": (
            "WikiQuality-AI/1.0 "
            "(educational project)"
        )
    }

    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=20
        )

    except requests.RequestException as error:
        return {
            "success": False,
            "message": "Unable to connect to Wikipedia.",
            "error": str(error)
        }

    if response.status_code == 404:
        return {
            "success": False,
            "message": "Wikipedia article not found.",
            "title": title
        }

    if response.status_code != 200:
        return {
            "success": False,
            "message": "Wikipedia API returned an unexpected response.",
            "status_code": response.status_code
        }

    try:
        data = response.json()

    except ValueError:
        return {
            "success": False,
            "message": "Wikipedia returned invalid JSON."
        }

    source = data.get("source", "")

    if not source:
        return {
            "success": False,
            "message": "Wikipedia article has no readable source content.",
            "title": data.get("title", title)
        }

    clean_text = clean_wikitext(source)

    return {
        "success": True,
        "article": {
            "id": data.get("id"),
            "title": data.get("title", title),
            "key": data.get("key"),
            "content_model": data.get("content_model"),
            "revision_id": (
                data.get("latest", {}).get("id")
                if isinstance(data.get("latest"), dict)
                else None
            ),
            "revision_timestamp": (
                data.get("latest", {}).get("timestamp")
                if isinstance(data.get("latest"), dict)
                else None
            ),
            "source_url": (
                f"https://en.wikipedia.org/wiki/"
                f"{quote(data.get('key', title).replace(' ', '_'), safe='')}"
            ),
            "raw_wikitext": source,
            "clean_text": clean_text
        }
    }