#!/usr/bin/env python3
"""
gen_skeleton.py — lay down the OKF knowledge/ bundle from taxonomy.json.

Fresh, minimal producer (NOT a port of the old 27KB scaffold.py). Reads the
canonical taxonomy (capabilities + competitors) and writes one markdown concept
per competitor, per capability, and per competitor x capability "offering" cell.

Idempotent: each file has an `okf:generated` marker; on re-run, anything a human
hand-edited BELOW the marker is preserved. Re-running only refreshes the
generated header (frontmatter + the marker line).

Usage:  python3 scripts/gen_skeleton.py
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
KB = ROOT / "knowledge"
TAXONOMY = json.loads((ROOT / "taxonomy.json").read_text(encoding="utf-8"))
CAPS = TAXONOMY["capabilities"]
COMPS = TAXONOMY["competitors"]

MARKER = "<!-- okf:generated — content below is hand-editable; re-running gen_skeleton.py preserves it -->"
PLACEHOLDER = "_To be filled during the research seed._"


def write(path: pathlib.Path, header: str, default_body: str) -> None:
    """Write `header` + marker + body, preserving any hand-edited body below the marker."""
    body = default_body
    if path.exists():
        existing = path.read_text(encoding="utf-8")
        if MARKER in existing:
            body = existing.split(MARKER, 1)[1].lstrip("\n")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"{header}\n{MARKER}\n\n{body}".rstrip() + "\n", encoding="utf-8")


def main() -> None:
    # Competitors
    for c in COMPS:
        header = (
            "---\n"
            "type: Competitor\n"
            f"slug: {c['slug']}\n"
            f"title: {c['name']}\n"
            "---"
        )
        write(KB / "competitors" / f"{c['slug']}.md", header, f"# AI summary\n\n{PLACEHOLDER}")

    # Capabilities
    for i, cap in enumerate(CAPS, start=1):
        header = (
            "---\n"
            "type: Capability\n"
            f"slug: {cap['id']}\n"
            f"title: {cap['title']}\n"
            f"description: {cap['blurb']}\n"
            f"sort_order: {i}\n"
            "---"
        )
        write(KB / "capabilities" / f"{cap['id']}.md", header, f"# State of the field\n\n{PLACEHOLDER}")

    # Offerings (competitor x capability)
    for c in COMPS:
        for cap in CAPS:
            header = (
                "---\n"
                "type: Offering\n"
                f"competitor: {c['slug']}\n"
                f"capability: {cap['id']}\n"
                "status: not_researched\n"
                "depth:\n"
                "primary_source:\n"
                "as_of:\n"
                "needs_verification: true\n"
                "---"
            )
            body = f"# Assessment\n\n{PLACEHOLDER}\n\n# Citations\n"
            write(KB / "offerings" / c["slug"] / f"{cap['id']}.md", header, body)

    # Reserved files (only create if missing — don't clobber a real index/log)
    index = KB / "index.md"
    if not index.exists():
        comp_links = "\n".join(f"- [{c['name']}](competitors/{c['slug']}.md)" for c in COMPS)
        cap_links = "\n".join(f"- [{cap['title']}](capabilities/{cap['id']}.md)" for cap in CAPS)
        index.write_text(
            '---\nokf_version: "0.1"\n'
            "type: Knowledge Bundle\n"
            "title: FieldPulse Competitor Intel — competitor AI offerings\n"
            "description: What ServiceTitan, Housecall Pro, and Jobber are shipping in AI, across 7 capability areas.\n"
            "---\n\n"
            f"# Competitors\n{comp_links}\n\n# Capabilities\n{cap_links}\n",
            encoding="utf-8",
        )

    log = KB / "log.md"
    if not log.exists():
        log.write_text(
            "# Log\n\n## 2026-06-30\n"
            "* Init: fresh OKF skeleton — 3 competitors × 7 capabilities (21 offering cells), "
            "all `status: not_researched`. Deep-research seeding fills the cells next.\n",
            encoding="utf-8",
        )

    n = len(COMPS) * len(CAPS)
    print(f"Wrote {len(COMPS)} competitors, {len(CAPS)} capabilities, {n} offering cells.")


if __name__ == "__main__":
    main()
