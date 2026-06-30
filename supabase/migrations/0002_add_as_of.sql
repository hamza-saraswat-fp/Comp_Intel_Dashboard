-- 0002_add_as_of.sql — freshness: the date a cell's research was last verified.
-- Trust signal for the exec view + the baseline the monitor compares "new" against.
-- Apply in the Supabase SQL Editor (or `supabase db push`) before the next projection.
alter table offerings add column if not exists as_of date;
