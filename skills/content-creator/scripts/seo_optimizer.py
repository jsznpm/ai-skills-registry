#!/usr/bin/env python3
"""Analyze content for SEO optimization and provide actionable recommendations."""

import re
import sys
import json

WORD_SPLIT = re.compile(r"[a-zA-Z0-9']+")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$", re.MULTILINE)
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def read_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def tokenize_words(text):
    return [w.lower() for w in WORD_SPLIT.findall(text)]


def keyword_density(words, keyword):
    if not keyword:
        return 0.0
    kw_words = keyword.lower().split()
    kw_len = len(kw_words)
    if kw_len == 0 or not words:
        return 0.0
    count = 0
    for i in range(len(words) - kw_len + 1):
        if words[i:i + kw_len] == kw_words:
            count += 1
    return round((count * kw_len / len(words)) * 100, 2)


def parse_headings(text):
    return [(len(h), title.strip()) for h, title in HEADING_RE.findall(text)]


def parse_links(text):
    return LINK_RE.findall(text)


def title_from_headings(headings):
    for level, title in headings:
        if level == 1:
            return title
    return None


def score_structure(headings, word_count):
    score = 0
    notes = []
    h1_count = sum(1 for level, _ in headings if level == 1)
    h2_count = sum(1 for level, _ in headings if level == 2)

    if h1_count == 1:
        score += 20
    else:
        notes.append("Use exactly one H1 (found %d)." % h1_count)

    if h2_count >= 2:
        score += 15
    else:
        notes.append("Add at least 2 H2 sections to break up content.")

    if word_count >= 1500:
        score += 15
    elif word_count >= 800:
        score += 8
        notes.append("Content is %d words — aim for 1,500+ for comprehensive coverage." % word_count)
    else:
        notes.append("Content is short (%d words) — thin content ranks poorly." % word_count)

    return score, notes


def score_keyword(words, word_count, primary_keyword, headings, title):
    score = 0
    notes = []

    if not primary_keyword:
        notes.append("No primary keyword provided — pass one for full SEO scoring.")
        return score, notes

    density = keyword_density(words, primary_keyword)
    if 1.0 <= density <= 3.0:
        score += 25
    elif density > 0:
        score += 10
        notes.append("Keyword density is %.2f%% — target 1-3%%." % density)
    else:
        notes.append("Primary keyword '%s' not found in content." % primary_keyword)

    kw_lower = primary_keyword.lower()
    if title and kw_lower in title.lower():
        score += 10
    else:
        notes.append("Include primary keyword in the title (H1).")

    h2_titles = " ".join(t for level, t in headings if level == 2).lower()
    if kw_lower in h2_titles:
        score += 10
    else:
        notes.append("Include primary keyword in at least one H2.")

    return score, notes


def score_links(links):
    score = 0
    notes = []
    internal = [l for l in links if not l[1].startswith("http")]
    external = [l for l in links if l[1].startswith("http")]

    if internal:
        score += 8
    else:
        notes.append("Add internal links to related content.")

    if external:
        score += 7
    else:
        notes.append("Add external links to authoritative sources.")

    return score, notes


def analyze(path, primary_keyword=None, secondary_keywords=None):
    text = read_text(path)
    words = tokenize_words(text)
    word_count = len(words)
    headings = parse_headings(text)
    links = parse_links(text)
    title = title_from_headings(headings)

    structure_score, structure_notes = score_structure(headings, word_count)
    keyword_score, keyword_notes = score_keyword(words, word_count, primary_keyword, headings, title)
    link_score, link_notes = score_links(links)

    total_score = structure_score + keyword_score + link_score

    secondary_hits = {}
    if secondary_keywords:
        for kw in secondary_keywords:
            kw = kw.strip()
            if kw:
                secondary_hits[kw] = keyword_density(words, kw)

    recommendations = structure_notes + keyword_notes + link_notes
    if not recommendations:
        recommendations.append("Content is well-optimized — no changes needed.")

    return {
        "file": path,
        "word_count": word_count,
        "title": title,
        "primary_keyword": primary_keyword,
        "primary_keyword_density": keyword_density(words, primary_keyword) if primary_keyword else None,
        "secondary_keyword_density": secondary_hits,
        "heading_count": len(headings),
        "internal_links": sum(1 for l in links if not l[1].startswith("http")),
        "external_links": sum(1 for l in links if l[1].startswith("http")),
        "seo_score": min(total_score, 100),
        "recommendations": recommendations,
    }


def print_text_report(report):
    print("SEO Analysis: %s" % report["file"])
    print("-" * 40)
    print("SEO Score: %d/100" % report["seo_score"])
    print("Word count: %d | Headings: %d" % (report["word_count"], report["heading_count"]))
    print("Internal links: %d | External links: %d" % (report["internal_links"], report["external_links"]))
    if report["primary_keyword"]:
        print("Primary keyword: '%s' (density %.2f%%)" % (report["primary_keyword"], report["primary_keyword_density"]))
    if report["secondary_keyword_density"]:
        print("Secondary keywords:")
        for kw, density in report["secondary_keyword_density"].items():
            print("  - %s: %.2f%%" % (kw, density))
    print("\nRecommendations:")
    for rec in report["recommendations"]:
        print("  - %s" % rec)


def main():
    if len(sys.argv) < 2:
        print("Usage: seo_optimizer.py <file> [primary_keyword] [secondary_keywords_comma_separated]")
        sys.exit(1)

    path = sys.argv[1]
    primary_keyword = sys.argv[2] if len(sys.argv) > 2 else None
    secondary_keywords = sys.argv[3].split(",") if len(sys.argv) > 3 else None

    report = analyze(path, primary_keyword, secondary_keywords)
    print_text_report(report)


if __name__ == "__main__":
    main()
