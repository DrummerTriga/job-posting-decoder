# 🔍 Job Posting Decoder

> Cut through the corporate speak. Paste a job posting, get the truth.

Powered by **Claude Sonnet** — this tool strips away buzzwords, spots red flags, and gives you an honest read on what a company is actually asking for. Analyses are saved to your account so you can revisit and categorize them later.

---

## What it does

Paste any job posting and get back a structured analysis:

| Signal | What you get |
|---|---|
| 🛠 **Technologies Required** | Every tech stack item mentioned, clearly listed |
| 📊 **Seniority (Advertised vs. Real)** | What they say vs. what they actually want |
| 🚩 **Red Flags** | Toxic culture patterns & unrealistic expectations, explained |
| 💬 **Buzzwords Detected** | Ninja, rockstar, fast-paced — called out |

Each analysis is **persisted to your account** and shown in the dashboard, where you can tag it as:

- ✅ **Apply!** — worth pursuing
- 🚩 **Red Flag!** — stay away
- ❌ **Not for me** — not the right fit

---

## Stack

- **[Next.js 16](https://nextjs.org)** — App Router + API routes
- **[Anthropic SDK](https://github.com/anthropic-ai/anthropic-sdk-typescript)** — Claude Sonnet for analysis
- **[Supabase](https://supabase.com)** — Auth (email/password) + Postgres + Storage
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** — Server-side PDF text extraction
- **[TypeScript](https://www.typescriptlang.org)** — Full type safety
- **[Tailwind CSS v4](https://tailwindcss.com)** — Dark UI styling

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
  created_at timestamptz default now()
);
```

Enable **Row Level Security** on both tables:

```sql
alter table job_analyses enable row level security;

create policy "Users can manage their own analyses"
  on job_analyses for all
  using (auth.uid() = user_id);

alter table cvs enable row level security;

create policy "Users can manage their own CV"
  on cvs for all
  using (auth.uid() = user_id);
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
Claude Sonnet analyzes the text
        ↓
Returns structured JSON → saved to Supabase (job_analyses)
        ↓
[Dashboard] Lists all past analyses
        ↓
User tags each analysis: Apply / Red Flag / Not for me
        ↓
PATCH /api/jobs/[id]/category updates the record
```

---

## Project structure

```
├── app/
│   ├── page.tsx                        # Root redirect
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Global styles
│   ├── login/                          # Login page
│   ├── signup/                         # Signup page
│   ├── profile/
│   │   └── page.tsx                    # CV upload page
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
│       └── jobs/[id]/
│           └── category/
│               └── route.ts            # PATCH → update category
├── components/
│   ├── JobCard.tsx                     # Dashboard card with category actions
│   └── LogoutButton.tsx                # Auth logout
├── lib/
│   └── supabase/                       # Supabase client helpers (server + client)
├── middleware.ts                       # Route protection (auth guard)
└── .env.local                          # Your secrets (not committed)
```

---

## Auth & route protection

Routes `/analyze`, `/dashboard`, and `/profile` are protected by `middleware.ts`. Unauthenticated requests are redirected to `/login`. Session management is handled via `@supabase/ssr` with cookie-based tokens.

---

## Current state

This is an intermediate phase of the project. Core features are working end-to-end:

- [x] Auth (signup, login, logout)
- [x] Job posting analysis via Claude
- [x] Analyses saved per user in Supabase
- [x] Dashboard with history
- [x] Category tagging (Apply / Red Flag / Not for me)
- [x] CV upload — PDF parsed server-side, stored in Supabase Storage, text extracted and saved

Still to come:
- [ ] Use CV text in the analysis prompt (match against job requirements)
- [ ] Full detail view per analysis
- [ ] Filtering and sorting in the dashboard
- [ ] UI polish pass

---

## License

MIT
