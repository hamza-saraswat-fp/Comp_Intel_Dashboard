# Competitor Intel dashboard

The UI for FieldPulse's Competitor Intel: a one-page view of how FieldPulse and its main FSM rivals (ServiceTitan, Housecall Pro, Jobber) compare across AI capabilities. It renders an at-a-glance status matrix, per-competitor profiles, and a capability slide-out with the full four-way comparison and sources.

## Stack

Vite + React + TypeScript, styled with Tailwind CSS v4 and shadcn/ui (Radix). Montserrat is the brand font. This is the only approved stack: every UI change is a React component using Tailwind utility classes and shadcn/ui primitives.

## Develop

```bash
npm install     # install dependencies
npm run dev     # start the Vite dev server
npm run build   # type-check (tsc -b) and build for production
npm run lint    # run oxlint
```

## Data

The app renders entirely from a typed `DATA` object in `src/data.ts`, a seed snapshot of the competitive landscape. Views read it through the helpers in `src/lib/model.ts`, so the source is swappable: Hamza will replace the seed with a Supabase fetch, and the views need no changes.

Competitor logos load from logo.dev; FieldPulse uses `public/fp-icon.svg`; a missing logo falls back to an initials chip.
