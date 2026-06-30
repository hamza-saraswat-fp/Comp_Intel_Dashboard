# Auto-sync GitHub Action (IAI-234)

The Action that re-projects the OKF bundle into Supabase on every merge. It isn't
committed as a live workflow yet because adding files under `.github/workflows/`
needs a token with the `workflow` OAuth scope. To enable it, drop this into
`.github/workflows/project-okf.yml` (via the GitHub web UI, or `gh auth refresh -s workflow`
then commit it) and add the two repo secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

```yaml
name: Project OKF → Supabase

on:
  push:
    branches: [main]
    paths:
      - "knowledge/**"
      - "taxonomy.json"
      - "scripts/**"
  workflow_dispatch:

jobs:
  project:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt

      # Hard gate: a non-conformant bundle fails here and never reaches Supabase.
      - name: Validate OKF (gate)
        run: python scripts/validate_okf.py

      - name: Project to Supabase
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: python scripts/project_okf.py
```
