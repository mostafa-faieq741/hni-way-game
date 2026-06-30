# HNI Way — Backend Setup

> الباك-إند بيشتغل على مرحلتين: **محلي** (تجربة فورية بملف JSON) و**أونلاين** (Supabase مجاني). متظبّط إنك تنقل من الأول للتاني من غير ما تلمس كود اللعبة — بس تحط مفاتيح الـ env.

## What this gives you

- A **projects catalogue** the admin can add to / edit / delete from the Admin dashboard.
- The game loads projects from the backend at startup, and **falls back to the bundled defaults** if the backend is offline.
- A storage layer that runs on a **local JSON file** in development and on **Supabase (Postgres)** in production — chosen automatically from environment variables.

---

## 1) Run it locally (no accounts needed)

```bash
npm install
npm run dev:api     # backend on http://localhost:3001
npm run dev         # game on http://localhost:5173 (proxies /api to 3001)
```

- Projects are stored in `api/data/projects.json` (created automatically from `api/data/projects.seed.json`).
- Open the game → Sign in as **Admin** → **Manage Projects** to add/edit projects.
- Add a project, set it **Published**, and it shows up in the player's Sales Requests.

---

## 2) Go online with Supabase (free)

1. Create a free project at <https://supabase.com>.
2. Open **SQL Editor** → paste the contents of `api/data/schema.sql` → **Run**. This creates the `projects`, `players`, and `game_state` tables.
3. In **Project Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_KEY` (server-side secret — never put it in the browser)
4. Put them in `.env.local` (local) and in your host's environment variables (Vercel/Netlify dashboard) for production.

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...
```

When both variables are present the backend uses Supabase automatically (`GET /api/health` shows `"storage":"supabase"`). When they're absent it uses the local JSON file. No code changes needed either way.

> Optional: seed Supabase with the starter projects by inserting the rows from `api/data/projects.seed.json` (or just add them through the Admin UI once Supabase is connected).

---

## API reference

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/projects` | Published projects (what the game loads) |
| GET | `/api/projects?all=1` | All projects incl. drafts (admin) |
| GET | `/api/projects/:id` | One project |
| POST | `/api/projects` | Create (validates input) |
| PUT | `/api/projects/:id` | Update |
| DELETE | `/api/projects/:id` | Delete |
| GET | `/api/teams` | Valid execution-team ids |
| GET | `/api/health` | `{ ok, storage }` |

Invalid input returns `400 { errors: { field: message } }`; the Admin form shows these inline.

---

## Project fields (what the admin fills)

Required: `title`, `stars` (1–4), `durationQuarters`, `revenue`, `cost` (< revenue), `reputationImpact`, `minReputation`, `clientBrief`, `executionTeams` (≥1, not Sales), `salesRequirement {type, count}`, `availableFromQuarter`/`availableToQuarter`.
Optional: `costBreakdown`, `bonusCondition`, `failCondition`, `published`.
Auto / derived: `id` (PRJ-NNN), `level` (= stars), `quarterAvailable`, `requiredDepartments`.

---

## Next step: per-player save / resume

The `players` + `game_state` tables are ready for it. Right now the game saves progress to the browser (`localStorage`), so a learner resumes on the **same browser**. To resume **across devices**, the game's save/load should call `/api/save-progress` and `/api/load-progress` (scaffolded in `api/`) against the same Supabase. That's a focused follow-up — ask when you want it wired.
