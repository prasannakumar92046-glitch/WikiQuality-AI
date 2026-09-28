import csv
import os

from ml_dataset import DATASET_FILE, DATASET_COLUMNS, FEATURE_NAMES, QUALITY_LABELS


def validate_dataset():
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

    # --------------------------------------------------
    # Check columns
    # --------------------------------------------------

    actual_columns = reader.fieldnames or []

    missing_columns = [
        column
        for column in DATASET_COLUMNS
        if column not in actual_columns
    ]

    extra_columns = [
        column
        for column in actual_columns
        if column not in DATASET_COLUMNS
    ]

    # --------------------------------------------------
    # Check quality labels
    # --------------------------------------------------

    label_counts = {
        label: 0
        for label in QUALITY_LABELS
    }

    invalid_labels = []

    for row in rows:
        label = row.get("quality_label", "").strip()

        if label in label_counts:
            label_counts[label] += 1
        else:
            invalid_labels.append(label)

    # --------------------------------------------------
    # Check duplicate article IDs
    # --------------------------------------------------

    article_ids = [
        row.get("article_id", "").strip()
        for row in rows
    ]

    duplicate_article_ids = sorted({
        article_id
        for article_id in article_ids
        if article_id and article_ids.count(article_id) > 1
    })

    # --------------------------------------------------
    # Check missing values
    # --------------------------------------------------

    missing_values = {}

    for column in DATASET_COLUMNS:

        missing_count = sum(
            1
            for row in rows
            if not str(row.get(column, "")).strip()
        )

        if missing_count > 0:
            missing_values[column] = missing_count

    # --------------------------------------------------
    # Check numeric ML features
    # --------------------------------------------------

    invalid_numeric_features = []

    for row_number, row in enumerate(rows, start=2):

        for feature in FEATURE_NAMES:

            value = row.get(feature, "").strip()

            if not value:
                continue

            try:
                float(value)
            except ValueError:
                invalid_numeric_features.append({
                    "row": row_number,
                    "feature": feature,
                    "value": value
                })

    # --------------------------------------------------
    # Summary
    # --------------------------------------------------

    validation_passed = (
        len(missing_columns) == 0
        and len(invalid_labels) == 0
        and len(duplicate_article_ids) == 0
        and len(invalid_numeric_features) == 0
    )

    return {
        "success": True,
        "validation_passed": validation_passed,
        "dataset_file": DATASET_FILE,
        "total_rows": len(rows),
        "feature_count": len(FEATURE_NAMES),
        "total_columns": len(actual_columns),
        "quality_label_distribution": label_counts,
        "missing_columns": missing_columns,
        "extra_columns": extra_columns,
        "invalid_labels": sorted(set(invalid_labels)),
        "duplicate_article_ids": duplicate_article_ids,
        "missing_values": missing_values,
        "invalid_numeric_features": invalid_numeric_features
    }