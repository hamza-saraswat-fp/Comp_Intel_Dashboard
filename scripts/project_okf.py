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

from okf_parser import RESERVED, as_bool, citations, clean, features, parse_frontmatter, section

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
            "features": [
                {"key": r["key"], "title": r["value"], "sort_order": i}
                for i, r in enumerate(features(body))
            ],
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
            "detail": clean(section(body, "Detail")),
            "primary_source": (fm.get("primary_source") or "").strip() or None,
            "sources": citations(body),
            "features": [
                {"key": r["key"], "value": r["value"], "note": r["note"]}
                for r in features(body)
            ],
            "needs_verification": as_bool(fm.get("needs_verification")),
            "as_of": (fm.get("as_of") or "").strip() or None,
        })

    detections = []
    ddir = KB / "detections"
    if ddir.exists():
        for path in sorted(ddir.glob("*.md")):
            if path.name in RESERVED:
                continue
            fm, _ = _read(path)
            if fm.get("type") != "Detection":
                continue
            detections.append({
                "id": fm.get("id", path.stem),
                "competitor": (fm.get("competitor") or "").strip() or None,
                "capability": (fm.get("capability") or "").strip() or None,  # nullable: uncategorized allowed
                "what": fm.get("what", ""),
                "kind": (fm.get("kind") or "").strip() or None,
                "significance": (fm.get("significance") or "").strip() or None,
                "source_url": (fm.get("source_url") or "").strip() or None,
                "first_seen": (fm.get("first_seen") or "").strip() or None,
                "okf_path": str(path.relative_to(ROOT)),
            })

    return competitors, capabilities, offerings, detections


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="print rows, don't touch Supabase")
    args = ap.parse_args()

    competitors, capabilities, offerings, detections = build_rows()
    print(f"Parsed {len(competitors)} competitors, {len(capabilities)} capabilities, "
          f"{len(offerings)} offerings, {len(detections)} detections.")

    if args.dry_run:
        print(json.dumps({"competitors": competitors, "capabilities": capabilities,
                          "offerings": offerings, "detections": detections}, indent=2))
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
    if detections:
        db.table("detections").upsert(detections, on_conflict="id").execute()
        # Prune detections only when some are present (append-only feed; never wipe on an empty parse).
        cur_det = {d["id"] for d in detections}
        for row in db.table("detections").select("id").execute().data:
            if row["id"] not in cur_det:
                db.table("detections").delete().eq("id", row["id"]).execute()

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
