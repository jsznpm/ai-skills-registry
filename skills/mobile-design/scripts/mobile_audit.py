#!/usr/bin/env python3
"""Mobile UX & touch static audit.

Scans a React Native / Flutter project for common mobile anti-patterns defined
in the mobile-design skill (lists, touch targets, security, animation, logging).

Usage:
    python scripts/mobile_audit.py <project_path>

Exit code: 0 = no findings, 1 = findings reported. Heuristic / best-effort:
it flags suspicious patterns by regex; treat results as leads, not verdicts.
"""

from __future__ import annotations

import os
import re
import sys

# (id, severity, file-regex, line-regex, message)
RULES = [
    # ---- Lists / performance ----------------------------------------------
    ("RN-SCROLLVIEW-MAP", "HIGH", r"\.(tsx|jsx|ts|js)$",
     r"<ScrollView",
     "ScrollView found - if rendering a long/dynamic list, use FlatList/FlashList."),
    ("RN-INDEX-KEY", "MED", r"\.(tsx|jsx|ts|js)$",
     r"key=\{[^}]*\bindex\b[^}]*\}",
     "Index used as key - use a stable unique id (reorder/insert bugs)."),
    ("RN-NO-NATIVE-DRIVER", "MED", r"\.(tsx|jsx|ts|js)$",
     r"useNativeDriver\s*:\s*false",
     "useNativeDriver:false - animation runs on JS thread; set true."),
    ("FLUTTER-LISTVIEW-CHILDREN", "HIGH", r"\.dart$",
     r"ListView\s*\(\s*children",
     "ListView(children:) builds all items - use ListView.builder for long lists."),
    # ---- Logging ----------------------------------------------------------
    ("LOG-CONSOLE", "MED", r"\.(tsx|jsx|ts|js)$",
     r"\bconsole\.log\s*\(",
     "console.log present - strip from release builds (blocks JS thread)."),
    ("LOG-PRINT-DART", "LOW", r"\.dart$",
     r"(?<!debug)\bprint\s*\(",
     "print() in Dart - use debugPrint and strip from release."),
    # ---- Security ---------------------------------------------------------
    ("SEC-ASYNCSTORAGE-TOKEN", "HIGH", r"\.(tsx|jsx|ts|js)$",
     r"AsyncStorage\.[a-zA-Z]+\([^)]*(token|password|secret|auth)",
     "Sensitive value in AsyncStorage - use SecureStore/Keychain."),
    ("SEC-HARDCODE-KEY", "HIGH", r"\.(tsx|jsx|ts|js|dart)$",
     r"(api[_-]?key|secret|client[_-]?secret)\s*[:=]\s*['\"][A-Za-z0-9_\-]{16,}['\"]",
     "Hardcoded key/secret - load from env/secure storage (extractable from binary)."),
]

SKIP_DIRS = {"node_modules", ".git", "build", "dist", "ios/Pods", "Pods",
             ".dart_tool", ".expo", "android/.gradle", "vendor", ".next"}

SEV_ORDER = {"HIGH": 0, "MED": 1, "LOW": 2}


def iter_files(root: str):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            yield os.path.join(dirpath, name)


def audit(root: str):
    compiled = [(rid, sev, re.compile(fr), re.compile(lr), msg)
                for (rid, sev, fr, lr, msg) in RULES]
    findings = []
    for path in iter_files(root):
        matched_file = [(rid, sev, lre, msg)
                        for (rid, sev, fre, lre, msg) in compiled
                        if fre.search(path)]
        if not matched_file:
            continue
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                lines = fh.readlines()
        except OSError:
            continue
        for n, line in enumerate(lines, 1):
            for rid, sev, lre, msg in matched_file:
                if lre.search(line):
                    rel = os.path.relpath(path, root)
                    findings.append((sev, rel, n, rid, msg, line.strip()[:100]))
    return findings


def main(argv):
    if len(argv) != 2:
        print("usage: python mobile_audit.py <project_path>", file=sys.stderr)
        return 2
    root = argv[1]
    if not os.path.isdir(root):
        print(f"not a directory: {root}", file=sys.stderr)
        return 2

    findings = audit(root)
    findings.sort(key=lambda f: (SEV_ORDER.get(f[0], 9), f[1], f[2]))

    print(f"\nMobile audit: {root}")
    print("=" * 60)
    if not findings:
        print("No anti-patterns detected. (Heuristic scan - still review manually.)")
        return 0

    counts = {}
    for sev, rel, n, rid, msg, snippet in findings:
        counts[sev] = counts.get(sev, 0) + 1
        print(f"[{sev:4}] {rel}:{n}  {rid}")
        print(f"        {msg}")
        print(f"        > {snippet}")
    print("=" * 60)
    summary = ", ".join(f"{k}={counts[k]}" for k in ("HIGH", "MED", "LOW") if k in counts)
    print(f"{len(findings)} finding(s): {summary}")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
