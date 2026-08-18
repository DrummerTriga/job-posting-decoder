"use client";

import { useState } from "react";
import Link from "next/link";
import AnalysisDetail from "@/components/AnalysisDetail";
import CategoryButtons from "@/components/CategoryButtons";
import { updateJobCategory } from "@/lib/jobs";
import { splitTitle } from "@/lib/types";
import { MODEL } from "@/lib/model";
import type { JobAnalysis } from "@/lib/types";

// Mirrors the guard in /api/decode so the button explains itself before the
// request is ever sent.
const MIN_CHARS = 20;

export default function Analyze() {
  const [jobPosting, setJobPosting] = useState("");
  const [result, setResult] = useState<JobAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tagging, setTagging] = useState(false);
  const [tagError, setTagError] = useState("");

  const trimmedLength = jobPosting.trim().length;
  const tooShort = trimmedLength < MIN_CHARS;

  const handleSubmit = async () => {
    if (tooShort || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPosting }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category: string) => {
    if (!result) return;

    setTagging(true);
    setTagError("");

    const response = await updateJobCategory(result.id, category);

    if (response.ok) {
      setResult({ ...result, category });
    } else {
      setTagError(response.error);
    }

    setTagging(false);
  };

  const reset = () => {
    setJobPosting("");
    setResult(null);
    setError("");
    setTagError("");
  };

  return (
    <main className="flex-1 bg-neutral-950 text-neutral-100">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs bg-neutral-900 border border-neutral-800 text-neutral-400">
            Powered by {MODEL}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Decode a posting
          </h1>
          <p className="text-neutral-400 max-w-2xl">
            Paste the advert — the whole thing, buzzwords and all — and get back
            what they&apos;re really asking for. Every analysis is saved to your
            dashboard.
          </p>
        </div>

        {!result && (
          <section className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden transition-colors focus-within:border-neutral-600">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-800">
              <label
                htmlFor="job-posting"
                className="text-sm font-medium text-neutral-200"
              >
                Job posting
              </label>
              <span
                className={`text-xs ${tooShort && trimmedLength > 0 ? "text-yellow-500" : "text-neutral-500"}`}
              >
                {trimmedLength.toLocaleString("en-GB")} characters
              </span>
            </div>

            <textarea
              id="job-posting"
              className="w-full h-64 p-4 bg-transparent text-sm leading-relaxed resize-y focus:outline-none placeholder:text-neutral-600"
              placeholder="Paste the full job posting text here — the whole advert, buzzwords and all."
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  handleSubmit();
                }
              }}
              disabled={loading}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-neutral-800">
              <p className="text-xs text-neutral-500">
                {tooShort
                  ? `Paste at least ${MIN_CHARS} characters.`
                  : "Press ⌘/Ctrl + Enter to analyse."}
              </p>

              <div className="flex items-center gap-2">
                {jobPosting && !loading && (
                  <button
                    onClick={reset}
                    className="px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={loading || tooShort}
                  className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Analysing…" : "Analyse posting"}
                </button>
              </div>
            </div>
          </section>
        )}

        {!result && !loading && <WhatYouGet />}

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {loading && <ResultSkeleton />}

        {result && (
          <>
            <section className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-green-400">
                    Analysed and saved to your dashboard.
                  </p>
                  <h2 className="text-xl font-semibold mt-1">
                    {splitTitle(result.raw_job_text).title ?? "Analysis"}
                  </h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Decide what to do with it — you can always change your mind
                    later.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={reset}
                    className="px-3 py-1.5 rounded-lg text-sm text-neutral-300 border border-neutral-700 hover:bg-neutral-800"
                  >
                    Analyse another
                  </button>
                  <Link
                    href="/dashboard"
                    className="text-sm text-neutral-400 hover:text-neutral-100 underline"
                  >
                    Dashboard →
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-neutral-500 mr-1">Tag it:</span>
                <CategoryButtons
                  category={result.category}
                  updating={tagging}
                  onChange={handleCategoryChange}
                />
              </div>

              {tagError && <p className="text-red-400 text-sm">{tagError}</p>}
            </section>

            <AnalysisDetail job={result} />
          </>
        )}
      </div>
    </main>
  );
}

const SIGNALS = [
  {
    emoji: "\u{1F6E0}",
    title: "Technologies",
    body: "Every stack item mentioned, pulled out of the prose.",
  },
  {
    emoji: "\u{1F4CA}",
    title: "Real seniority",
    body: "What the title says versus what the requirements actually demand.",
  },
  {
    emoji: "\u{1F6A9}",
    title: "Red flags",
    body: "Toxic patterns and unrealistic expectations, each one explained.",
  },
  {
    emoji: "\u{1F4AC}",
    title: "Buzzwords",
    body: "Ninja, rockstar, fast-paced — named and counted.",
  },
];

function WhatYouGet() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">What you get back</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {SIGNALS.map((signal) => (
          <div
            key={signal.title}
            className="p-4 rounded-xl bg-neutral-900 border border-neutral-800"
          >
            <span className="text-xl">{signal.emoji}</span>
            <h3 className="font-semibold text-sm mt-2">{signal.title}</h3>
            <p className="text-sm text-neutral-400 mt-1">{signal.body}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500">
        Tip: paste the full advert rather than a summary — the red flags usually
        hide in the parts people skim.
      </p>
    </section>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {[64, 96, 80].map((height, i) => (
        <div
          key={i}
          className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 animate-pulse"
        >
          <div className="h-3 w-32 rounded bg-neutral-800" />
          <div className="mt-3 rounded bg-neutral-800/60" style={{ height }} />
        </div>
      ))}
      <p className="text-sm text-neutral-500 text-center">
        Claude is reading the posting…
      </p>
    </div>
  );
}
