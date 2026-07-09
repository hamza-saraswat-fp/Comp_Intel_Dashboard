#!/usr/bin/env python3
"""
okf_parser.py — the one shared OKF reader.

Tiny, dependency-free helpers used by both validate_okf.py and project_okf.py so
there is exactly one way the bundle is parsed (no drift). Frontmatter is the
small flat YAML subset OKF uses (scalar `key: value` lines only).
"""
from __future__ import annotations

import re

# Reserved OKF filenames that are not concept docs (no frontmatter required).
RESERVED = {"index.md", "log.md"}
_CITE_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
_FEATURE_LINE = re.compile(r"^-\s*([A-Za-z0-9_-]+)\s*:\s*(.+?)\s*$", re.M)
_FEATURE_NOTE = re.compile(r"^(\S+)\s+\((.+)\)\s*$")
_PLACEHOLDER_PREFIXES = ("_to be filled", "_add ", "_verify", "_summarize", "todo")


def parse_frontmatter(text: str):
    """Return (frontmatter_dict, body). Empty dict if no parseable frontmatter."""
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    block = text[3:end].strip("\n")
    body = text[end + 4 :]
    fm = {}
    for line in block.splitlines():
        s = line.strip()
        if not s or s.startswith("#") or ":" not in line:
            continue
        k, v = line.split(":", 1)
        fm[k.strip()] = v.strip()
    return fm, body


def section(body: str, heading: str) -> str:
    """Text under a `# heading` up to the next heading (or end)."""
    m = re.search(rf"^#\s+{re.escape(heading)}\s*$(.*?)(^#\s|\Z)", body, re.M | re.S)
    return m.group(1).strip() if m else ""


def clean(text) -> str | None:
    """Normalize a value: empty / placeholder prose -> None."""
    if text is None:
        return None
    t = str(text).strip()
    if not t:
        return None
    if t.lower().startswith(_PLACEHOLDER_PREFIXES):
        return None
    return t


def citations(body: str):
    """[{'title','url'}] harvested from the `# Citations` section."""
    return [{"title": t, "url": u} for t, u in _CITE_RE.findall(section(body, "Citations"))]


def as_bool(value) -> bool:
    return str(value).strip().lower() in ("true", "yes", "1")


def features(body: str):
    """[{'key','value','note'}] from a `# Features` list of `- key: value (note)` lines.

    In a capability file `value` is the human title (no parenthetical). In an
    offering file `value` is one of yes|partial|no|unknown, with an optional
    `(note)`. Callers shape these into the row they need.
    """
    rows = []
    for key, rest in _FEATURE_LINE.findall(section(body, "Features")):
        m = _FEATURE_NOTE.match(rest)
        if m:
            rows.append({"key": key, "value": m.group(1), "note": m.group(2)})
        else:
            rows.append({"key": key, "value": rest, "note": None})
    return rows
