#!/usr/bin/env python3
"""
write_research.py — render verified research JSON into the OKF bundle.

Input JSON (the research-workflow output):
  { "competitors":  [{"slug","summary"}],
    "capabilities": [{"id","stateOfTheField"}],
    "cells":        [{"competitor","capability","status","depth","product","assessment",
                      "detail","primary_source","citations":[{"title","url"}],
                      "needs_verification","verifyNotes"}] }

Writes each offering cell (frontmatter + # Assessment / # Detail / # Citations) and the
competitor / capability summaries, BELOW the okf:generated marker. Stamps as_of on every
researched cell. Competitor/capability frontmatter is preserved (title/description/sort_order).

Usage:  python3 scripts/write_research.py <research.json> [--as-of YYYY-MM-DD]
"""
from __future__ import annotations

import argparse
import datetime
import json
import pathlib

from okf_parser import parse_frontmatter

ROOT = pathlib.Path(__file__).resolve().parent.parent
KB = ROOT / "knowledge"
MARKER = "<!-- okf:generated — content below is hand-editable; re-running gen_skeleton.py preserves it -->"


def existing_fm(path: pathlib.Path) -> dict:
    if not path.exists():
        return {}
    fm, _ = parse_frontmatter(path.read_text(encoding="utf-8"))
    return fm


def write_file(path: pathlib.Path, header: str, body: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"{header}\n{MARKER}\n\n{body}".rstrip() + "\n", encoding="utf-8")


def fm_line(key: str, value) -> str:
    v = (value or "").strip() if isinstance(value, str) else value
    return f"{key}: {v}\n" if v not in (None, "", "na") else f"{key}:\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("research_json")
    ap.add_argument("--as-of", default=datetime.date.today().isoformat())
    args = ap.parse_args()

    data = json.loads(pathlib.Path(args.research_json).read_text(encoding="utf-8"))
    as_of = args.as_of

    # --- Offerings -------------------------------------------------------------
    n_cells = 0
    for cell in data.get("cells", []):
        comp, cap = cell["competitor"], cell["capability"]
        header = (
            "---\n"
            "type: Offering\n"
            f"competitor: {comp}\n"
            f"capability: {cap}\n"
            f"status: {cell.get('status', 'not_researched')}\n"
            + fm_line("depth", cell.get("depth"))
            + fm_line("primary_source", cell.get("primary_source"))
            + fm_line("as_of", as_of)
            + f"needs_verification: {'true' if cell.get('needs_verification') else 'false'}\n"
            + "---"
        )
        cites = cell.get("citations") or []
        cite_lines = "\n".join(f"[{i + 1}] [{c['title']}]({c['url']})" for i, c in enumerate(cites)) or "_None recorded._"
        assessment = (cell.get("assessment") or "").strip() or "_Not researched._"
        detail = (cell.get("detail") or "").strip() or "_Not researched._"
        body = f"# Assessment\n\n{assessment}\n\n# Detail\n\n{detail}\n\n# Citations\n\n{cite_lines}"
        write_file(KB / "offerings" / comp / f"{cap}.md", header, body)
        n_cells += 1

    # --- Competitor summaries (preserve frontmatter) ---------------------------
    for c in data.get("competitors", []):
        path = KB / "competitors" / f"{c['slug']}.md"
        fm = existing_fm(path)
        header = "---\ntype: Competitor\n" + f"slug: {c['slug']}\n" + f"title: {fm.get('title', c['slug'])}\n" + "---"
        write_file(path, header, f"# AI summary\n\n{(c.get('summary') or '').strip()}")

    # --- Capability state-of-the-field (preserve frontmatter) ------------------
    for cap in data.get("capabilities", []):
        path = KB / "capabilities" / f"{cap['id']}.md"
        fm = existing_fm(path)
        header = (
            "---\ntype: Capability\n"
            + f"slug: {cap['id']}\n"
            + f"title: {fm.get('title', cap['id'])}\n"
            + fm_line("description", fm.get("description"))
            + f"sort_order: {fm.get('sort_order', 0)}\n"
            + "---"
        )
        write_file(path, header, f"# State of the field\n\n{(cap.get('stateOfTheField') or '').strip()}")

    # --- Log -------------------------------------------------------------------
    log = KB / "log.md"
    prev = log.read_text(encoding="utf-8") if log.exists() else "# Log\n"
    entry = (
        f"\n## {as_of}\n"
        f"* Deep-research seed: filled {n_cells} offering cells (ServiceTitan / Housecall Pro / Jobber) "
        f"with cited assessments + status/depth; authored competitor + capability summaries.\n"
    )
    log.write_text(prev.rstrip() + "\n" + entry, encoding="utf-8")

    print(f"Wrote {n_cells} offering cells, {len(data.get('competitors', []))} competitor summaries, "
          f"{len(data.get('capabilities', []))} capability summaries. as_of={as_of}")


if __name__ == "__main__":
    main()
