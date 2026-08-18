# 🔍 Job Posting Decoder

> Cut through the corporate speak. Paste a job posting, get the truth.

Powered by **`claude-sonnet-4-6`** — this tool strips away buzzwords, spots red flags, and gives you an honest read on what a company is actually asking for. Analyses are saved to your account so you can revisit and categorize them later.

---

## 📖 Why I built this

This project started as a hands-on way to learn full-stack development with the Claude API — going beyond tutorials and into something with real moving parts. Specifically, I wanted to get comfortable with the **Anthropic SDK** (structured outputs, prompt design for both extraction and comparison tasks), **Supabase** (Postgres, Auth, Storage, and Row-Level Security as a way to enforce data isolation at the database level rather than just in application code), and server-side file handling in **Next.js** (file uploads, PDF parsing, and the client/server split in the App Router).

It's also a genuinely useful tool I use myself while job hunting, which made the learning process more concrete: every feature exists because it solved an actual problem I ran into (e.g., wanting to track which jobs I'd already reviewed, or checking how well my CV actually matches a posting before applying).

Building it end-to-end — including debugging real production issues like PDF worker configuration and Storage RLS policies — taught me more than any isolated tutorial would have.

---

## What it does

Paste any job posting and get back a structured analysis:

| Signal | What you get |
|---|---|
| 🏷 **Title** | A one-line label for the role, e.g. *Full Stack Developer at Adobe* — inferred when the company isn't named |
| 🛠 **Technologies Required** | Every tech stack item mentioned, clearly listed |
| 📊 **Seniority (Advertised vs. Real)** | What they say vs. what they actually want |
| 🚩 **Red Flags** | Toxic culture patterns & unrealistic expectations, explained |
| 💬 **Buzzwords Detected** | Ninja, rockstar, fast-paced — called out |
| 🎯 **CV Match** | Score 0–100, matching skills, missing skills, honest assessment |

Each analysis is **persisted to your account** and shown in the dashboard, where you can:

- Tag it: ✅ **Apply!** / 🚩 **Red Flag!** / ❌ **Not for me**
- Open it in a detail modal to read the full breakdown
- Compare it against your uploaded CV and get an instant fit score

---

## Pages

| Route | What it is |
|---|---|
| `/` | Landing page when signed out (with an interactive worked example); a personal hub with counters, quick actions and recent analyses when signed in |
| `/analyze` | Paste and decode a posting, then tag the result without leaving the page |
| `/dashboard` | History of every analysis, with tagging and a full-detail modal |
| `/profile` | CV upload (drag & drop), current CV status and a preview of the extracted text |
| `/login`, `/signup` | Email + password auth |

A shared nav bar (Home / Analyze / Dashboard / My CV) is rendered from the root layout for signed-in users and hides itself on the auth pages.

---

## Stack

- **[Next.js 16](https://nextjs.org)** — App Router + API routes
- **[Anthropic SDK](https://github.com/anthropic-ai/anthropic-sdk-typescript)** — `claude-sonnet-4-6` for analysis (the model id lives in `lib/model.ts` and is shown in the UI)
- **[Supabase](https://supabase.com)** — Auth (email/password) + Postgres + Storage
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** — Server-side PDF text extraction
- **[TypeScript](https://www.typescriptlang.org)** — Full type safety
- **[Tailwind CSS v4](https://tailwindcss.com)** — Dark UI styling

No UI component library, no extra runtime dependencies — the modal is a native `<dialog>`, the rest is Tailwind.

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/DrummerTriga/job-posting-decoder.git
cd job-posting-decoder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file at the root:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> - Anthropic API key → [console.anthropic.com](https://console.anthropic.com)
> - Supabase credentials → [supabase.com/dashboard](https://supabase.com/dashboard)

### 4. Set up the database

In your Supabase project, create the following tables:

```sql
create table job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  raw_job_text text not null,
  technologies_required text[] default '{}',
  seniority_advertised text,
  seniority_estimated_real text,
  red_flags text[] default '{}',
  buzzwords_detected text[] default '{}',
  category text check (category in ('apply', 'red_flag', 'not_for_me')),
  created_at timestamptz default now()
);

create table cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  file_path text not null,
  extracted_text text not null,
  uploaded_at timestamptz default now()
);

create table cv_comparisons (
  id uuid primary key default gen_random_uuid(),
  job_analysis_id uuid references job_analyses not null,
  cv_id uuid references cvs not null,
  match_score integer not null,
  analysis_text jsonb not null,
  created_at timestamptz default now()
);
```

Enable **Row Level Security** on all three tables:

```sql
alter table job_analyses enable row level security;

create policy "Users can manage their own analyses"
  on job_analyses for all
  using (auth.uid() = user_id);

alter table cvs enable row level security;

create policy "Users can manage their own CV"
  on cvs for all
  using (auth.uid() = user_id);

alter table cv_comparisons enable row level security;

create policy "Users can manage their own comparisons"
  on cv_comparisons for all
  using (
    exists (
      select 1 from job_analyses
      where job_analyses.id = cv_comparisons.job_analysis_id
        and job_analyses.user_id = auth.uid()
    )
  );
```

Create a **Storage bucket** named `cvs` (private) for the raw PDF files:

```sql
-- In Supabase dashboard: Storage → New bucket → name: "cvs", public: false
-- Then add a storage policy:
create policy "Users can manage their own CV files"
  on storage.objects for all
  using (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and start decoding.

---

## How it works

```
User signs up / logs in (Supabase Auth)
        ↓
[Profile] Upload CV (PDF) → POST /api/cv/upload
        ↓
pdf-parse extracts raw text server-side
        ↓
PDF stored in Supabase Storage (bucket: cvs)
Extracted text + file path saved to cvs table
        ↓
[Analyze] Paste job posting → POST /api/decode
        ↓
Claude answers with a one-line title, then the JSON analysis
        ↓
The route splits the two, parses the JSON, and stores the title
as the first line of raw_job_text  → saved to Supabase (job_analyses)
        ↓
[Analyze] Result shown inline — tag it without leaving the page
        ↓
[Dashboard] Lists all past analyses, titles first
        ↓
User tags each analysis: Apply / Red Flag / Not for me
        ↓
PATCH /api/jobs/[id]/category updates the record
        ↓
[Dashboard] Click a card → detail modal with the full breakdown
        ↓
"Compare with my CV" → POST /api/compare-cv
        ↓
Claude compares CV text vs. job posting (cached per CV + posting)
        ↓
Returns match score, matching skills, missing skills, assessment
        → saved to cv_comparisons table
```

### A note on the title

There is no `title` column. Claude is asked to open its answer with a single title line before the JSON; `/api/decode` splits that line off and stores it as the first line of `raw_job_text`, separated by a blank line. `splitTitle()` in `lib/types.ts` splits it back out wherever an analysis is displayed. Rows saved before this existed simply render without a title.

---

## Project structure

```
├── app/
│   ├── page.tsx                        # Landing (signed out) / hub (signed in)
│   ├── layout.tsx                      # Root layout + shared nav
│   ├── globals.css                     # Global styles
│   ├── login/                          # Login page
│   ├── signup/                         # Signup page
│   ├── profile/
│   │   └── page.tsx                    # CV status + upload
│   ├── analyze/
│   │   └── page.tsx                    # Paste & analyze a job posting
│   ├── dashboard/
│   │   └── page.tsx                    # History of all analyses
│   └── api/
│       ├── decode/
│       │   └── route.ts                # POST → Anthropic SDK → save to DB
│       ├── cv/
│       │   └── upload/
│       │       └── route.ts            # POST → pdf-parse → Supabase Storage + DB
│       ├── compare-cv/
│       │   └── route.ts                # POST → Claude compares CV vs. job → save to DB
│       └── jobs/[id]/
│           └── category/
│               └── route.ts            # PATCH → update category
├── components/
│   ├── Nav.tsx                         # Shared nav bar with active state
│   ├── JobList.tsx                     # Dashboard list + modal state
│   ├── JobCard.tsx                     # Dashboard card with tagging
│   ├── JobModal.tsx                    # Full-detail modal (native <dialog>)
│   ├── AnalysisDetail.tsx              # One rendering of an analysis, shared
│   ├── CategoryButtons.tsx             # Apply / Red Flag / Not for me
│   ├── CompareCvButton.tsx             # Inline CV comparison with score breakdown
│   ├── CvUploader.tsx                  # Drag & drop upload + CV status
│   ├── LandingDemo.tsx                 # Interactive worked example on the landing
│   ├── Section.tsx, Stat.tsx           # Shared UI primitives
│   └── LogoutButton.tsx                # Auth logout
├── lib/
│   ├── supabase/                       # Supabase client helpers (server + client)
│   ├── types.ts                        # JobAnalysis type, categories, splitTitle()
│   ├── jobs.ts                         # Shared category PATCH helper
│   └── model.ts                        # The Claude model id, used by API and UI
├── middleware.ts                       # Route protection (auth guard)
└── .env.local                          # Your secrets (not committed)
```

---

## Auth & route protection

Routes `/analyze`, `/dashboard`, and `/profile` are protected by `middleware.ts`. Unauthenticated requests are redirected to `/login`. Session management is handled via `@supabase/ssr` with cookie-based tokens.

---

## Current state

Core features work end-to-end:

- [x] Auth (signup, login, logout)
- [x] Job posting analysis via Claude
- [x] Analyses saved per user in Supabase
- [x] Dashboard with history
- [x] Category tagging (Apply / Red Flag / Not for me)
- [x] CV upload — PDF parsed server-side, stored in Supabase Storage, text extracted and saved
- [x] CV vs. job comparison — match score, matching/missing skills, overall assessment
- [x] Landing page and signed-in hub
- [x] Shared nav bar across the app
- [x] Full detail view per analysis (modal)
- [x] Generated title shown first on every card
- [x] UI polish pass across all pages

Still to come:
- [ ] Filtering and sorting in the dashboard
- [ ] Search across saved analyses
- [ ] Deleting an analysis

---

<sub>The UI rework across these pages was carried out with [Claude Code](https://claude.com/claude-code), for efficiency.</sub>

## License

MIT
