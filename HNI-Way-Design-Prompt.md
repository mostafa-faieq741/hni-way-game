# HNI Way — UI / Layout Design Prompt
*(Paste this into Claude Design / Canva to generate the game's screens and UI.)*

---

## 1. What this is

**HNI Way** is a web-based business-simulation learning game for **Human Network International (HNI)**, used for employee onboarding. The player runs a training/learning company for **20 quarters (5 years)**: they hire staff across 12 departments, win client project briefs, deliver them, manage cash, and grow company **Reputation**. It is embedded inside an LMS (TalentLMS), built in React, and must look like a clean, modern, professional SaaS dashboard — **not** a cartoonish arcade game.

**Tone:** corporate, confident, friendly, premium. Think Linear / Notion / Stripe dashboard polish, applied to a serious-but-fun business sim. Calm surfaces, clear hierarchy, generous white space, **no heavy drop-shadows**, no gradients-for-the-sake-of-it.

---

## 2. Brand system (use exactly)

**Colors**
- Primary (HNI magenta): `#91195A` — buttons, headers, key accents
- Primary dark: `#70134A` · Primary light tint: `#F9EDF4`
- Emerald (success/positive): `#0C6E3A` · light `#E8F4ED`
- Green accent: `#28A456`
- Violet: `#3A37C4` · light `#EEEEFF` · Majorelle `#5B58E0`
- Gold (highlights / stars / reputation): `#F1BD19` · light `#FDF8E1`
- Error/negative: `#B91C1C` · light `#FEF2F2`
- Text: `#231F20` · Muted text: `#6B666B`
- App background: `#F7F6F5` · Surface/cards: `#FFFFFF` · Borders: `#EDE8ED`

**Typography**
- Headings: **Montserrat** (fallback Trebuchet MS / Segoe UI)
- Body: **Source Sans 3** (fallback Calibri)
- Line-height ~1.6, antialiased.

**Shape & spacing**
- 8px spacing scale (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64).
- Radii: small 6px, medium 10px, large 14px, xl 20px, pills fully rounded.
- Shadows are subtle only: `0 1px 4px rgba(145,25,90,0.07)`. Avoid drama.
- Header height 64px, bottom nav 72px, max content width 900px (centered).

---

## 3. App shell (persistent chrome on game screens)

- **Top header (sticky, 64px):** HNI logo left; a horizontal **stat bar** showing 4 KPIs — Cash ($), Quarter (e.g. "Q2 · Year 1"), Employees count, Reputation — each as a compact pill with icon + animated number. Reputation pill tinted gold. A 2px magenta bottom border under the header.
- **Bottom nav (72px):** icon+label tabs for Home, Projects, Finance, Forecast, and a menu (Glossary / Leaderboard / Theme toggle).
- **Floating "End Quarter" button:** bottom-right, primary magenta, prominent. This is the main commit action.
- Light/dark theme toggle supported — design both.

---

## 4. Screens to design

### A. Pre-game onboarding flow (full-screen, no chrome)
1. **Start screen** — big branded hero, game title "HNI Way", subtitle, single "Start" CTA.
2. **Objectives screen** — what the player is trying to achieve (grow reputation past 100, survive 20 quarters).
3. **Key Terms screen** — glossary cards of business terms (revenue, cost ratio, reputation, specialist vs consultant).
4. **Before You Play** — the rules / how-to in friendly cards.
5. **Ready to Start** — confirmation splash.
6. **Player Setup** — name entry + avatar/company name; primary continue button.

### B. Home — "Command Center" (the core screen)
This is the most important layout.
- **Stat bar** on top (the 4 KPIs).
- **Main column (left, wide):** project pipeline — large cards for **client briefs to accept** and **active projects in progress**, each card showing client, star-level (1–5 ★), revenue, status, and a CTA. Empty-state friendly.
- **Sidebar (right, narrow):** the 12 **departments** as compact unit cards showing headcount and a hire affordance.
- **Reputation progress bar** toward the 100 threshold (gold fill).
- A collapsible **"Company Health"** panel.
- An opt-in **"This Quarter" guidance checklist** that appears via a small "?" tooltip — hidden by default, not in the user's face.

### C. Projects
- **Sales Request List** — incoming client briefs to browse/accept.
- **Project Detail** — full brief: client, star level, revenue, costs, requirements, with a **consequence preview** before accepting and inline validation ("you can't accept this yet because…"). *Note: the specific departments a project requires are deliberately hidden from the player — show requirements abstractly, never reveal the exact department list (it's a learning mechanic).*
- **Active Projects** — in-progress work with delivery status.

### D. Departments
- **Department Detail** — info on one of 12 departments (Sales, Gamification, Resources, Studio, E-Learning, Operations, Finance, Proposal, HR, Procurement, R&D, L&D). HR must be hired first. Show headcount, cost, role description.
- **Hire modal** — pick specialist ($5k/qtr) or consultant ($10k/qtr), confirm cost.

### E. Finance & Forecast
- **Finance screen** — cash flow, revenue vs costs, simple readable charts.
- **Forecast screen** — paid forecast ($15k/yr) showing upcoming demand/trends.

### F. End-of-period
- **End Quarter modal** — a **preview-then-commit** flow: show what will happen this quarter, let the player confirm, then a **post-commit summary modal** of results (cash change, reputation change, projects delivered).
- **Year Summary screen** — recap at end of each year.
- **Final Report screen** — end-of-game results, score, win/lose.

### G. Overlays / components (style these as a set)
Reusable buttons (primary/secondary/ghost), confirm dialog, event modal (random business events), tutorial overlay, leaderboard modal (reputation > 100 qualifies), glossary modal, toast notifications, animated stat numbers, quarter focus timer (opt-in, never auto-ends a quarter), smart-play tip banners, star ratings.

---

## 5. Key UX principles to honor in the design

1. **Players never feel rushed** — the timer is opt-in and never force-ends a turn.
2. **Decisions are previewed before committed** — every consequential action (accept project, end quarter) shows an outcome preview first.
3. **Required project departments stay hidden** — figuring out the right team is the learning challenge; never expose it in the UI.
4. **Projects are front-and-center; departments are supporting** — pipeline gets the main column, departments the sidebar.
5. **Guidance is available but never nagging** — checklists/tips are opt-in tooltips, not permanent clutter.

---

## 6. Deliverable I want from you (Claude Design)

Produce a cohesive UI kit + key screens for HNI Way:
- The **brand/style frame** (colors, type, buttons, cards, badges).
- The **Home "Command Center"** in both light and dark.
- **Project Detail**, **Hire modal**, **End Quarter preview + summary**, **Finance**, and the **Final Report**.
- A few onboarding screens (Start, Player Setup).

Desktop-first, responsive down to tablet. Clean SaaS-dashboard aesthetic, on the HNI magenta brand.
