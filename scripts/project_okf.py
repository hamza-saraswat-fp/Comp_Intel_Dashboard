#!/usr/bin/env python3
"""
project_okf.py — project the OKF bundle into Supabase (the one-way sink).

Reads knowledge/ via okf_parser (the same reader the validator uses), builds the
competitor / capability / offering rows, and upserts them into Supabase, then
prunes rows whose key no longer exists in the bundle. The bundle is the source of
truth; this DB is disposable (drop + re-run = identical state).

Usage:
  python3 scripts/project_okf.py --dry-run     # print the rows, touch nothing
  python3 scripts/project_okf.py               # upsert + prune (needs env below)

Env (for a real run):
  SUPABASE_URL                 https://<ref>.supabase.co
  SUPABASE_SERVICE_ROLE_KEY    service-role key (bypasses RLS; never client-side)
"""
from __future__ import annotations

import argparse
import json
import os
import pathlib
import sys

from okf_parser import RESERVED, as_bool, citations, clean, parse_frontmatter, section

ROOT = pathlib.Path(__file__).resolve().parent.parent
KB = ROOT / "knowledge"
PRUNE_FLOOR = 10  # refuse to prune if fewer than this many offerings parsed (guards a broken checkout)


def _read(path: pathlib.Path):
    return parse_frontmatter(path.read_text(encoding="utf-8"))


def build_rows():
    competitors, capabilities, offerings = [], [], []

    for path in sorted((KB / "competitors").glob("*.md")):
        if path.name in RESERVED:
            continue
        fm, body = _read(path)
        competitors.append({
            "slug": fm.get("slug", path.stem),
            "name": fm.get("title", path.stem),
            "summary": clean(section(body, "AI summary")),
        })

    for path in sorted((KB / "capabilities").glob("*.md")):
        if path.name in RESERVED:
            continue
        fm, body = _read(path)
        capabilities.append({
            "slug": fm.get("slug", path.stem),
            "title": fm.get("title", path.stem),
            "blurb": clean(fm.get("description")),
            "overall": clean(section(body, "State of the field")),
            "sort_order": int(fm.get("sort_order", "0") or 0),
        })

    for path in sorted((KB / "offerings").rglob("*.md")):
        if path.name in RESERVED:
            continue
        fm, body = _read(path)
        if fm.get("type") != "Offering":
            continue
        offerings.append({
            "competitor": fm.get("competitor"),
            "capability": fm.get("capability"),
            "status": fm.get("status", "not_researched") or "not_researched",
            "depth": (fm.get("depth") or "").strip() or None,
            "assessment": clean(section(body, "Assessment")),
            "primary_source": (fm.get("primary_source") or "").strip() or None,
            "sources": citations(body),
            "needs_verification": as_bool(fm.get("needs_verification")),
            "as_of": (fm.get("as_of") or "").strip() or None,
        })

    return competitors, capabilities, offerings


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="print rows, don't touch Supabase")
    args = ap.parse_args()

    competitors, capabilities, offerings = build_rows()
    print(f"Parsed {len(competitors)} competitors, {len(capabilities)} capabilities, {len(offerings)} offerings.")

    if args.dry_run:
        print(json.dumps({"competitors": competitors, "capabilities": capabilities, "offerings": offerings}, indent=2))
        return 0

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
    if not url or not key:
        print("✗ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for a real run "
              "(use --dry-run to preview).", file=sys.stderr)
        return 2

    from supabase import create_client  # imported lazily so --dry-run needs no deps

    db = create_client(url, key)

    # Parents before children (FKs). Upsert is keyed on the natural primary keys.
    db.table("competitors").upsert(competitors, on_conflict="slug").execute()
    db.table("capabilities").upsert(capabilities, on_conflict="slug").execute()
    db.table("offerings").upsert(offerings, on_conflict="competitor,capability").execute()

    # Prune rows whose key no longer exists in the bundle (full reconcile),
    # guarded so a partial/empty bundle can't wipe the DB.
    if len(offerings) >= PRUNE_FLOOR:
        cur_off = {(o["competitor"], o["capability"]) for o in offerings}
        for row in db.table("offerings").select("competitor,capability").execute().data:
            if (row["competitor"], row["capability"]) not in cur_off:
                db.table("offerings").delete().eq("competitor", row["competitor"]).eq("capability", row["capability"]).execute()
        cur_caps = {c["slug"] for c in capabilities}
        for row in db.table("capabilities").select("slug").execute().data:
            if row["slug"] not in cur_caps:
                db.table("capabilities").delete().eq("slug", row["slug"]).execute()
        cur_comp = {c["slug"] for c in competitors}
        for row in db.table("competitors").select("slug").execute().data:
            if row["slug"] not in cur_comp:
                db.table("competitors").delete().eq("slug", row["slug"]).execute()
    else:
        print(f"⚠ only {len(offerings)} offerings parsed (< {PRUNE_FLOOR}) — skipping prune.")

    print("✅ Projected to Supabase.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
