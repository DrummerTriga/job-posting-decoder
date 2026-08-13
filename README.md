# 🔍 Job Posting Decoder

> Cut through the corporate speak. Paste a job posting, get the truth.

Powered by **Claude Sonnet** — this tool strips away buzzwords, spots red flags, and gives you an honest read on what a company is actually asking for.

---

## What it does

Paste any job posting and get back a structured analysis:

| Signal | What you get |
|---|---|
| 🛠 **Technologies Required** | Every tech stack item mentioned, clearly listed |
| 📊 **Seniority (Advertised vs. Real)** | What they say vs. what they actually want |
| 🚩 **Red Flags** | Toxic culture patterns & unrealistic expectations, explained |
| 💬 **Buzzwords Detected** | Ninja, rockstar, fast-paced — called out |

---

## Stack

- **[Next.js 16](https://nextjs.org)** — App Router + API routes
- **[Anthropic SDK](https://github.com/anthropic-ai/anthropic-sdk-typescript)** — Claude Sonnet 4.5 for analysis
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

### 3. Set up your API key

Create a `.env.local` file at the root:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

> Get your API key at [console.anthropic.com](https://console.anthropic.com)

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — paste a job posting and hit **Analyze**.

---

## How it works

```
User pastes job posting
        ↓
POST /api/decode
        ↓
Claude Sonnet analyzes the text
        ↓
Returns structured JSON with technologies,
seniority estimate, red flags & buzzwords
        ↓
Rendered in a clean dark UI
```

The prompt instructs Claude to return **pure JSON only** — no markdown, no preamble — parsed directly on the server and forwarded to the client.

---

## Project structure

```
├── app/
│   ├── page.tsx          # Main UI — textarea + results
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── api/
│       └── decode/
│           └── route.ts  # POST handler → Anthropic SDK
├── public/
├── package.json
└── .env.local            # Your API key (not committed)
```

---

## License

MIT
