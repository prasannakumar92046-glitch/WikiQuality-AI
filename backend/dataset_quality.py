import csv
import os

from ml_dataset import DATASET_FILE, FEATURE_NAMES, QUALITY_LABELS


MIN_SAMPLES_PER_CLASS = 5


def analyze_dataset_quality():
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

    # -----------------------------------------
    # Class distribution
    # -----------------------------------------

    class_distribution = {
        label: 0
        for label in QUALITY_LABELS
    }

    for row in rows:
        label = row.get(
            "quality_label",
            ""
        ).strip()

        if label in class_distribution:
            class_distribution[label] += 1

    represented_classes = [
        label
        for label, count in class_distribution.items()
        if count > 0
    ]

    missing_classes = [
        label
        for label, count in class_distribution.items()
        if count == 0
    ]

    underrepresented_classes = [
        label
        for label, count in class_distribution.items()
        if 0 < count < MIN_SAMPLES_PER_CLASS
    ]

    # -----------------------------------------
    # Duplicate article IDs
    # -----------------------------------------

    article_ids = [
        row.get(
            "article_id",
            ""
        ).strip()
        for row in rows
    ]

    duplicate_article_ids = sorted({
        article_id
        for article_id in article_ids
        if article_id
        and article_ids.count(article_id) > 1
    })

    # -----------------------------------------
    # Missing feature values
    # -----------------------------------------

    missing_feature_values = {}

    for feature in FEATURE_NAMES:

        missing_count = sum(
            1
            for row in rows
            if not str(
                row.get(feature, "")
            ).strip()
        )

        if missing_count > 0:
            missing_feature_values[
                feature
            ] = missing_count

    # -----------------------------------------
    # Invalid numeric values
    # -----------------------------------------

    invalid_numeric_values = []

    for row_number, row in enumerate(
        rows,
        start=2
    ):

        for feature in FEATURE_NAMES:

            value = row.get(
                feature,
                ""
            ).strip()

            if not value:
                continue

            try:
                float(value)

            except ValueError:

                invalid_numeric_values.append({
                    "row": row_number,
                    "feature": feature,
                    "value": value
                })

    # -----------------------------------------
    # Dataset size checks
    # -----------------------------------------

    total_articles = len(rows)

    enough_classes = len(
        represented_classes
    ) >= 2

    all_classes_sufficient = (
        len(underrepresented_classes) == 0
    )

    no_duplicates = (
        len(duplicate_article_ids) == 0
    )

    no_invalid_numeric_values = (
        len(invalid_numeric_values) == 0
    )

    # -----------------------------------------
    # Overall ML readiness
    # -----------------------------------------

    ml_ready = (
        total_articles >= 30
        and enough_classes
        and all_classes_sufficient
        and no_duplicates
        and no_invalid_numeric_values
    )

    # -----------------------------------------
    # Recommendations
    # -----------------------------------------

    recommendations = []

    if total_articles < 30:
        recommendations.append(
            "Collect more labeled Wikipedia articles "
            "before training the ML model."
        )

    if missing_classes:
        recommendations.append(
            "Collect articles from missing quality classes: "
            + ", ".join(missing_classes)
        )

    if underrepresented_classes:
        recommendations.append(
            "Increase samples for underrepresented classes: "
            + ", ".join(underrepresented_classes)
        )

    if duplicate_article_ids:
        recommendations.append(
            "Remove duplicate article IDs."
        )

    if missing_feature_values:
        recommendations.append(
            "Investigate missing ML feature values."
        )

    if invalid_numeric_values:
        recommendations.append(
            "Fix invalid numeric feature values."
        )

    if not recommendations:
        recommendations.append(
            "Dataset passed the current quality checks."
        )

    return {
        "success": True,

        "dataset_file": DATASET_FILE,

        "total_articles": total_articles,

        "feature_count": len(
            FEATURE_NAMES
        ),

        "quality_classes": QUALITY_LABELS,

        "represented_classes": represented_classes,

        "missing_classes": missing_classes,

        "class_distribution": class_distribution,

        "underrepresented_classes":
            underrepresented_classes,

        "minimum_samples_per_class":
            MIN_SAMPLES_PER_CLASS,

        "duplicate_article_ids":
            duplicate_article_ids,

        "missing_feature_values":
            missing_feature_values,

        "invalid_numeric_values":
            invalid_numeric_values,

        "ml_readiness": {
            "enough_articles":
                total_articles >= 30,

            "enough_classes":
                enough_classes,

            "classes_sufficient":
                all_classes_sufficient,

            "no_duplicates":
                no_duplicates,

            "no_invalid_numeric_values":
                no_invalid_numeric_values,

            "training_ready":
                ml_ready
        },

        "recommendations":
            recommendations
    }