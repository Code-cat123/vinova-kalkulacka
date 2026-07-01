-- ---------- tabulka hodnocení (Neon Postgres) ----------
-- user_id = id uživatele z Neon Auth (Stack Auth). Vlastnictví se vynucuje
-- na serveru v dotazech (WHERE user_id = <přihlášený uživatel>), proto zde
-- není RLS ani odkaz na auth.users (to je specifické pro Supabase).

create table if not exists public.tastings (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  name        text not null,
  type        text not null check (type in ('tiche','sumive')),
  vintage     text,
  producer    text,
  variety     text,
  tasted_on   date not null default current_date,
  grades      jsonb not null default '{}'::jsonb,   -- criterionId -> grade index (0..4)
  total_score int  not null default 0,
  medal       text not null default 'zadna',
  note        text,
  photo_url   text,                                  -- veřejná (nezhádnutelná) URL z Vercel Blob
  photo_path  text,                                  -- klíč objektu v Blob storu (pro mazání)
  created_at  timestamptz not null default now()
);

create index if not exists tastings_user_idx
  on public.tastings (user_id, tasted_on desc);
