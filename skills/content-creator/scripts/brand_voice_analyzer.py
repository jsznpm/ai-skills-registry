#!/usr/bin/env python3
"""Analyze text for brand voice characteristics, readability, and consistency."""

import re
import sys
import json

FORMAL_MARKERS = {"furthermore", "therefore", "consequently", "moreover", "utilize", "regarding", "shall"}
CASUAL_MARKERS = {"gonna", "wanna", "yeah", "hey", "cool", "awesome", "stuff", "kinda"}
FIRST_PERSON = {"i", "we", "our", "us", "my"}
SECOND_PERSON = {"you", "your", "yours"}

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")
WORD_SPLIT = re.compile(r"[a-zA-Z']+")


def read_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def tokenize_words(text):
    return [w.lower() for w in WORD_SPLIT.findall(text)]


def split_sentences(text):
    text = text.strip()
    if not text:
        return []
    return [s for s in SENTENCE_SPLIT.split(text) if s.strip()]


def count_syllables(word):
    word = word.lower()
    vowels = "aeiouy"
    count = 0
    prev_was_vowel = False
    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev_was_vowel:
            count += 1
        prev_was_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    return max(count, 1)


def flesch_reading_ease(words, sentences):
    if not words or not sentences:
        return 0.0
    total_syllables = sum(count_syllables(w) for w in words)
    words_per_sentence = len(words) / len(sentences)
    syllables_per_word = total_syllables / len(words)
    score = 206.835 - (1.015 * words_per_sentence) - (84.6 * syllables_per_word)
    return round(score, 1)


def readability_label(score):
    if score >= 90:
        return "Very Easy (5th grade)"
    if score >= 80:
        return "Easy (6th grade)"
    if score >= 70:
        return "Fairly Easy (7th grade)"
    if score >= 60:
        return "Standard (8th-9th grade)"
    if score >= 50:
        return "Fairly Difficult (10th-12th grade)"
    if score >= 30:
        return "Difficult (college)"
    return "Very Difficult (college graduate)"


def analyze_formality(words):
    word_set = set(words)
    formal_hits = len(word_set & FORMAL_MARKERS)
    casual_hits = len(word_set & CASUAL_MARKERS)
    if formal_hits > casual_hits:
        return "formal"
    if casual_hits > formal_hits:
        return "casual"
    return "neutral"


def analyze_perspective(words):
    first = sum(words.count(w) for w in FIRST_PERSON)
    second = sum(words.count(w) for w in SECOND_PERSON)
    if second > first * 1.2:
        return "second-person (audience-focused)"
    if first > second * 1.2:
        return "first-person (brand-focused)"
    return "mixed"


def sentence_length_stats(sentences):
    lengths = [len(tokenize_words(s)) for s in sentences]
    if not lengths:
        return {"avg": 0, "min": 0, "max": 0}
    return {
        "avg": round(sum(lengths) / len(lengths), 1),
        "min": min(lengths),
        "max": max(lengths),
    }


def recommendations(formality, readability_score, sentence_stats):
    recs = []
    if readability_score < 50:
        recs.append("Simplify sentences and word choice — content reads as college-level or harder.")
    if sentence_stats["avg"] > 25:
        recs.append("Average sentence length is high (%.1f words) — break up long sentences." % sentence_stats["avg"])
    if formality == "neutral":
        recs.append("Voice reads as neutral — pick formal or casual markers deliberately for consistency.")
    if not recs:
        recs.append("Voice and readability look consistent — no changes needed.")
    return recs


def analyze(path):
    text = read_text(path)
    words = tokenize_words(text)
    sentences = split_sentences(text)
    score = flesch_reading_ease(words, sentences)
    sentence_stats = sentence_length_stats(sentences)
    formality = analyze_formality(words)
    perspective = analyze_perspective(words)

    return {
        "file": path,
        "word_count": len(words),
        "sentence_count": len(sentences),
        "readability_score": score,
        "readability_label": readability_label(score),
        "sentence_length": sentence_stats,
        "formality": formality,
        "perspective": perspective,
        "recommendations": recommendations(formality, score, sentence_stats),
    }


def print_text_report(report):
    print("Brand Voice Analysis: %s" % report["file"])
    print("-" * 40)
    print("Words: %d | Sentences: %d" % (report["word_count"], report["sentence_count"]))
    print("Readability: %.1f (%s)" % (report["readability_score"], report["readability_label"]))
    print("Avg sentence length: %.1f words (min %d, max %d)" % (
        report["sentence_length"]["avg"], report["sentence_length"]["min"], report["sentence_length"]["max"]
    ))
    print("Formality: %s" % report["formality"])
    print("Perspective: %s" % report["perspective"])
    print("\nRecommendations:")
    for rec in report["recommendations"]:
        print("  - %s" % rec)


def main():
    if len(sys.argv) < 2:
        print("Usage: brand_voice_analyzer.py <file> [json|text]")
        sys.exit(1)

    path = sys.argv[1]
    fmt = sys.argv[2] if len(sys.argv) > 2 else "text"

    report = analyze(path)

    if fmt == "json":
        print(json.dumps(report, indent=2))
    else:
        print_text_report(report)


if __name__ == "__main__":
    main()
