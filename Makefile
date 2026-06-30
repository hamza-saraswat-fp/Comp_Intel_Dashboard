.PHONY: gen validate dry-run project rebuild-db

# Regenerate the knowledge/ skeleton from taxonomy.json (preserves hand-edits).
gen:
	python3 scripts/gen_skeleton.py

# OKF conformance gate.
validate:
	python3 scripts/validate_okf.py

# Print the rows that would be projected — needs no DB / no deps.
dry-run:
	python3 scripts/project_okf.py --dry-run

# Validate, then project the bundle into Supabase (needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
project: validate
	python3 scripts/project_okf.py

# Re-apply the schema (idempotent) and re-project from git — the DB is disposable.
# Requires a linked project:  supabase link --project-ref <ref>
rebuild-db:
	supabase db push
	python3 scripts/project_okf.py
