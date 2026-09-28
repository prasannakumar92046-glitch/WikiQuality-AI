import requests
from urllib.parse import quote


WIKIPEDIA_ACTION_API = "https://en.wikipedia.org/w/api.php"

QUALITY_LABELS = {
    "Stub",
    "Start",
    "C",
    "B",
    "GA",
    "FA"
}


def get_wikipedia_assessment(title: str) -> dict:
    """
    Retrieve Wikipedia PageAssessment data for an article.

    An article can have multiple WikiProject assessments, so this
    function returns all available assessments instead of assuming
    that one project represents the entire article.
    """

    title = title.strip()

    if not title:
        return {
            "success": False,
            "message": "Wikipedia article title is required."
        }

    params = {
        "action": "query",
        "prop": "pageassessments",
        "titles": title,
        "format": "json",
        "formatversion": "2"
    }

    headers = {
        "User-Agent": (
            "WikiQuality-AI/1.0 "
            "(educational project)"
        )
    }

    try:
        response = requests.get(
            WIKIPEDIA_ACTION_API,
            params=params,
            headers=headers,
            timeout=20
        )

    except requests.RequestException as error:
        return {
            "success": False,
            "message": "Unable to connect to Wikipedia assessment API.",
            "error": str(error)
        }

    if response.status_code != 200:
        return {
            "success": False,
            "message": "Wikipedia assessment API returned an unexpected response.",
            "status_code": response.status_code
        }

    try:
        data = response.json()

    except ValueError:
        return {
            "success": False,
            "message": "Wikipedia assessment API returned invalid JSON."
        }

    pages = data.get("query", {}).get("pages", [])

    if not pages:
        return {
            "success": False,
            "message": "No Wikipedia page was found.",
            "title": title
        }

    page = pages[0]

    if page.get("missing"):
        return {
            "success": False,
            "message": "Wikipedia article not found.",
            "title": title
        }

    assessments = page.get("pageassessments", {})

    assessment_records = []

    for project_name, assessment in assessments.items():
        quality_class = assessment.get("class")

        assessment_records.append({
            "project": project_name,
            "quality_class": quality_class,
            "importance": assessment.get("importance")
        })

    quality_classes = sorted({
        item["quality_class"]
        for item in assessment_records
        if item.get("quality_class")
    })

    recognized_classes = sorted(
        quality_class
        for quality_class in quality_classes
        if quality_class in QUALITY_LABELS
    )

    return {
        "success": True,
        "title": page.get("title", title),
        "page_id": page.get("pageid"),
        "assessment_count": len(assessment_records),
        "assessments": assessment_records,
        "recognized_quality_classes": recognized_classes,
        "quality_label": (
            recognized_classes[0]
            if len(recognized_classes) == 1
            else None
        ),
        "label_source": (
            "wikipedia_page_assessments"
            if recognized_classes
            else None
        ),
        "multiple_quality_classes": (
            len(recognized_classes) > 1
        )
    }