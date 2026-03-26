#!/usr/bin/env python3

import json
import math
import re
import sys
from collections import Counter


TOKEN_RE = re.compile(r"[a-z0-9]+")


def tokenize(value):
    return TOKEN_RE.findall(str(value).lower())


def build_text(book):
    return " ".join(
        [
            book.get("name", ""),
            book.get("name", ""),
            book.get("author", ""),
            book.get("publisher", ""),
            book.get("category", ""),
            book.get("description", ""),
            " ".join(book.get("tags", [])),
        ]
    )


def build_vector(tokens, idf):
    counts = Counter(tokens)
    total = sum(counts.values()) or 1
    return {token: (count / total) * idf[token] for token, count in counts.items()}


def cosine_similarity(left, right):
    if not left or not right:
        return 0.0

    dot = sum(left[token] * right.get(token, 0.0) for token in left)
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))

    if not left_norm or not right_norm:
        return 0.0

    return dot / (left_norm * right_norm)


def main():
    payload = json.load(sys.stdin)
    query = payload.get("query", "").strip()
    books = payload.get("books", [])

    if not query:
        json.dump({"results": [], "suggestions": []}, sys.stdout)
        return

    documents = []
    doc_frequency = Counter()

    for book in books:
        tokens = tokenize(build_text(book))
        documents.append((book, tokens))
        doc_frequency.update(set(tokens))

    query_tokens = tokenize(query)
    all_tokens = set(query_tokens)
    for _, tokens in documents:
        all_tokens.update(tokens)

    total_docs = max(len(documents), 1)
    idf = {
        token: math.log((1 + total_docs) / (1 + doc_frequency.get(token, 0))) + 1
        for token in all_tokens
    }

    query_vector = build_vector(query_tokens, idf)
    ranked = []

    for book, tokens in documents:
        doc_vector = build_vector(tokens, idf)
        score = cosine_similarity(query_vector, doc_vector)
        if score <= 0:
            continue

        ranked.append(
            {
                "id": book["id"],
                "name": book["name"],
                "author": book["author"],
                "category": book["category"],
                "score": round(score, 4),
            }
        )

    ranked.sort(key=lambda item: item["score"], reverse=True)
    ranked = ranked[:6]

    suggestions = []
    seen = set()
    for entry in ranked[:3]:
        for suggestion in [
            ("book", entry["name"]),
            ("author", entry["author"]),
            ("category", entry["category"]),
        ]:
            if not suggestion[1]:
                continue
            if suggestion in seen:
                continue
            seen.add(suggestion)
            suggestions.append({"type": suggestion[0], "label": suggestion[1]})

    json.dump(
        {
            "results": [{"id": entry["id"], "score": entry["score"]} for entry in ranked],
            "suggestions": suggestions,
        },
        sys.stdout,
    )


if __name__ == "__main__":
    main()
