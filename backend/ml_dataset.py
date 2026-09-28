import csv
import os
from typing import Dict, List


DATASET_FILE = "ml_training_dataset.csv"


QUALITY_LABELS = [
    "Stub",
    "Start",
    "C",
    "B",
    "GA",
    "FA"
]


FEATURE_NAMES = [
    "word_count",
    "sentence_count",
    "section_count",
    "short_section_count",
    "vocabulary_diversity",
    "repetition_ratio",
    "content_word_ratio",
    "average_sentence_length",
    "average_similarity",
    "semantic_redundancy_ratio",
    "lexical_diversity",
    "topic_count",
    "topic_diversity",
    "information_dimension_count",
    "information_diversity",
    "total_entity_mentions",
    "unique_entity_count",
    "entity_type_count",
    "entity_diversity",
    "covered_topic_count",
    "total_possible_topics",
    "topic_coverage_ratio",
    "citation_marker_count",
    "citation_needed_count",
    "url_count",
    "citation_density",
    "evidence_signal_count"
]


DATASET_COLUMNS = [
    "article_id",
    "title",
    "source_url",
    "source_type",
    "quality_label"
] + FEATURE_NAMES


def validate_quality_label(label: str) -> bool:
    return label in QUALITY_LABELS


def build_dataset_record(
    article_id: str,
    title: str,
    source_url: str,
    source_type: str,
    quality_label: str,
    features: Dict
) -> Dict:

    if not validate_quality_label(quality_label):
        raise ValueError(
            f"Invalid quality label: {quality_label}. "
            f"Allowed labels: {QUALITY_LABELS}"
        )

    record = {
        "article_id": article_id,
        "title": title,
        "source_url": source_url,
        "source_type": source_type,
        "quality_label": quality_label
    }

    for feature_name in FEATURE_NAMES:
        record[feature_name] = features.get(feature_name, 0)

    return record


def save_dataset_record(record: Dict) -> None:

    file_exists = os.path.exists(DATASET_FILE)

    with open(
        DATASET_FILE,
        "a",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=DATASET_COLUMNS
        )

        if not file_exists:
            writer.writeheader()

        writer.writerow(record)


def get_dataset_size() -> int:

    if not os.path.exists(DATASET_FILE):
        return 0

    with open(
        DATASET_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        reader = csv.DictReader(file)

        return sum(1 for _ in reader)