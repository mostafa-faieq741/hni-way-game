-- ─────────────────────────────────────────────────────────────────────────────
-- HNI Way game — Supabase (Postgres) schema
-- Paste this whole file into Supabase → SQL Editor → Run.
-- The backend talks to these tables with the SERVICE key (server-side only),
-- so Row Level Security can stay disabled for now.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) PROJECTS — the admin-managed catalogue shared by all players.
create table if not exists projects (
  id                     text primary key,           -- e.g. PRJ-009
  code                   text,
  title                  text not null,
  stars                  int  not null,
  level                  int,
  duration_quarters      int  not null,
  min_reputation         int  not null default 0,
  revenue                numeric not null,
  cost                   numeric not null,
  reputation_impact      int  not null default 0,
  client_brief           text not null,
  cost_breakdown         text,
  bonus_condition        text,
  fail_condition         text,
  execution_teams        jsonb not null default '[]'::jsonb,   -- ["ld","elearning"]
  sales_requirement      jsonb not null default '{"type":"specialist","count":1}'::jsonb,
  available_from_quarter int  not null default 1,
  available_to_quarter   int  not null default 20,
  published              boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- 2) PLAYERS — one row per learner (identity from TalentLMS/SCORM).
create table if not exists players (
  player_id          text primary key,
  talentlms_user_id  text,
  email              text,
  display_name       text,
  first_seen_at      timestamptz not null default now(),
  last_seen_at       timestamptz not null default now(),
  status             text default 'active'
);

-- 3) GAME_STATE — each player's saved game so they resume where they left off.
--    `state` holds the full snapshot (same shape the game saves locally);
--    the flat columns are denormalised for the admin leaderboard/queries.
create table if not exists game_state (
  player_id        text primary key references players(player_id) on delete cascade,
  state            jsonb not null,
  cash             numeric,
  reputation       int,
  net_profit       numeric,
  total_revenue    numeric,
  overall_quarter  int,
  game_status      text,
  qualified        boolean,
  updated_at       timestamptz not null default now()
);

create index if not exists projects_published_idx on projects (published);
create index if not exists game_state_updated_idx on game_state (updated_at desc);
