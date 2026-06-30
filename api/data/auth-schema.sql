-- HNI Way — auth schema additions.
-- Adds login fields to the existing `players` table so admin can create
-- player accounts (standalone, non-LMS mode). Safe to run more than once.

alter table players add column if not exists username      text;
alter table players add column if not exists password_hash text;
alter table players add column if not exists role          text not null default 'player';

create unique index if not exists players_username_key on players (username) where username is not null;
create index        if not exists players_role_idx     on players (role);

-- The admin login is validated against env vars (ADMIN_USERNAME / ADMIN_PASSWORD),
-- so no admin row is stored here. Player accounts are created via the Admin UI.
