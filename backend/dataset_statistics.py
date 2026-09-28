import csv
import os

from ml_dataset import DATASET_FILE, QUALITY_LABELS


MIN_SAMPLES_PER_CLASS = 5


def get_dataset_statistics():
    if not os.path.exists(DATASET_FILE):
        return {
            "success": False,
            "message": "Training dataset does not exist yet."
        }

    with open(
        DATASET_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        reader = csv.DictReader(file)
        rows = list(reader)

    if not rows:
        return {
            "success": False,
            "message": "Training dataset is empty."
        }

    label_counts = {
        label: 0
        for label in QUALITY_LABELS
    }

    for row in rows:
        label = row.get("quality_label", "").strip()

        if label in label_counts:
            label_counts[label] += 1

    underrepresented_classes = [
        label
        for label, count in label_counts.items()
        if count < MIN_SAMPLES_PER_CLASS
    ]

    represented_classes = [
        label
        for label, count in label_counts.items()
        if count > 0
    ]

    return {
        "success": True,
        "total_articles": len(rows),
        "quality_classes": QUALITY_LABELS,
        "class_distribution": label_counts,
        "represented_class_count": len(represented_classes),
        "total_class_count": len(QUALITY_LABELS),
        "underrepresented_classes": underrepresented_classes,
        "minimum_samples_per_class": MIN_SAMPLES_PER_CLASS,
        "training_ready": (
            len(represented_classes) >= 2
            and len(underrepresented_classes) == 0
        )
    }