import spacy
from collections import Counter


# --------------------------------------------------
# Load spaCy model
# --------------------------------------------------

nlp = spacy.load("en_core_web_sm")


# --------------------------------------------------
# Entity analysis
# --------------------------------------------------

def analyze_entities(text: str) -> dict:
    """
    Extract named entities using spaCy NER.
    """

    if not text.strip():
        return {
            "success": False,
            "message": "No text was provided."
        }

    doc = nlp(text)

    entities = []

    for entity in doc.ents:
        entities.append({
            "text": entity.text,
            "label": entity.label_,
            "label_description": spacy.explain(entity.label_)
        })

    # --------------------------------------------------
    # Entity counts
    # --------------------------------------------------

    entity_type_counts = Counter(
        entity["label"]
        for entity in entities
    )

    unique_entities = sorted(
        set(
            entity["text"]
            for entity in entities
        )
    )

    unique_entity_types = sorted(
        set(
            entity["label"]
            for entity in entities
        )
    )

    # --------------------------------------------------
    # Entity diversity
    # --------------------------------------------------

    total_entities = len(entities)
    unique_entity_count = len(unique_entities)
    entity_type_count = len(unique_entity_types)

    entity_diversity = (
        unique_entity_count / total_entities
        if total_entities > 0
        else 0.0
    )

    # --------------------------------------------------
    # Entity flags
    # --------------------------------------------------

    entity_flags = {
        "has_entities": total_entities > 0,
        "has_multiple_entity_types": entity_type_count >= 2,
        "has_people": "PERSON" in entity_type_counts,
        "has_locations": (
            "GPE" in entity_type_counts
            or "LOC" in entity_type_counts
        ),
        "has_organizations": "ORG" in entity_type_counts,
        "has_dates": "DATE" in entity_type_counts,
        "has_quantities": "QUANTITY" in entity_type_counts,
    }

    return {
        "success": True,

        "metrics": {
            "total_entity_mentions": total_entities,
            "unique_entity_count": unique_entity_count,
            "entity_type_count": entity_type_count,
            "entity_diversity": round(
                entity_diversity,
                3
            )
        },

        "entities": entities,

        "unique_entities": unique_entities,

        "entity_type_counts": dict(
            entity_type_counts
        ),

        "entity_flags": entity_flags
    }