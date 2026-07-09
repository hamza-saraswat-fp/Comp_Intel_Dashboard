-- 0004_features_detail.sql — feature checklist + surfaced detail.
-- See docs/feature-checklist-design.md. Additive and idempotent; applied by the
-- projector's owner (service-role key) via `supabase db push`.

alter table capabilities add column if not exists features jsonb not null default '[]';
alter table offerings   add column if not exists features jsonb not null default '[]';
alter table offerings   add column if not exists detail   text;
