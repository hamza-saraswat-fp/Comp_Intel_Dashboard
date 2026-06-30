#!/usr/bin/env python3
"""
validate_okf.py — OKF conformance gate (the merge gate).

Rule (OKF v0.1): every non-reserved .md under knowledge/ must have parseable YAML
frontmatter with a non-empty `type`. Broken links / missing optional fields are
soft (permissive consumption). Offering cells additionally must carry a `status`
in the allowed set and reference a real competitor + capability slug.

Exit 0 = conformant, 1 = not. Run before projecting.
"""
import pathlib
import sys

from okf_parser import RESERVED, parse_frontmatter

ROOT = pathlib.Path(__file__).resolve().parent.parent
KB = ROOT / "knowledge"
ALLOWED_STATUS = {"shipped", "beta", "announced", "none", "not_researched"}
ALLOWED_DEPTH = {"", "basic", "strong", "market_leading"}


def main() -> int:
    errors, warnings, count = [], [], 0
    comp_slugs, cap_slugs = set(), set()

    for path in sorted(KB.rglob("*.md")):
        if path.name in RESERVED:
            continue
        count += 1
        rel = path.relative_to(ROOT)
        fm, _ = parse_frontmatter(path.read_text(encoding="utf-8"))
        if not fm:
            errors.append(f"{rel}: missing/unparseable frontmatter")
            continue
        if not fm.get("type"):
            errors.append(f"{rel}: missing non-empty `type`")
        if fm.get("type") == "Competitor":
            comp_slugs.add(fm.get("slug", path.stem))
        if fm.get("type") == "Capability":
            cap_slugs.add(fm.get("slug", path.stem))

    # Second pass: offering cells reference real slugs + valid enums.
    for path in sorted((KB / "offerings").rglob("*.md")):
        if path.name in RESERVED:
            continue
        rel = path.relative_to(ROOT)
        fm, _ = parse_frontmatter(path.read_text(encoding="utf-8"))
        if fm.get("type") != "Offering":
            continue
        if fm.get("status", "not_researched") not in ALLOWED_STATUS:
            errors.append(f"{rel}: status `{fm.get('status')}` not in {sorted(ALLOWED_STATUS)}")
        if fm.get("depth", "") not in ALLOWED_DEPTH:
            errors.append(f"{rel}: depth `{fm.get('depth')}` not in {sorted(ALLOWED_DEPTH - {''})}")
        if fm.get("competitor") not in comp_slugs:
            warnings.append(f"{rel}: competitor `{fm.get('competitor')}` has no concept doc")
        if fm.get("capability") not in cap_slugs:
            warnings.append(f"{rel}: capability `{fm.get('capability')}` has no concept doc")

    print(f"Checked {count} concept docs.")
    for w in warnings:
        print(f"  ⚠ {w}")
    if errors:
        print(f"\n❌ NOT CONFORMANT — {len(errors)} error(s):")
        for e in errors:
            print(f"  ✗ {e}")
        return 1
    print("✅ Bundle is OKF v0.1 conformant.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
