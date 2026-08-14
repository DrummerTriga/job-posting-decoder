"use client";

import { useState } from "react";

type DecodedJob = {
  technologies_required: string[];
  seniority_advertised: string;
  seniority_estimated_real: string;
  red_flags: string[];
  buzzwords_detected: string[];
};

export default function Analyze() {
  const [jobPosting, setJobPosting] = useState("");
  const [result, setResult] = useState<DecodedJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
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

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Job Posting Decoder</h1>
        <p className="text-neutral-400 text-sm">
          Paste a job posting and find out what they&apos;re really asking for — no buzzwords.
        </p>

        <textarea
          className="w-full h-48 p-3 rounded-lg bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-neutral-500"
          placeholder="Paste the full job posting text here..."
          value={jobPosting}
          onChange={(e) => setJobPosting(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze posting"}
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {result && (
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700">
              <h2 className="font-semibold mb-2">Required technologies</h2>
              <div className="flex flex-wrap gap-2">
                {result.technologies_required.map((tech, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-blue-900/40 text-blue-300 text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700">
              <h2 className="font-semibold mb-2">Seniority</h2>
              <p className="text-sm text-neutral-400">
                Advertised: <span className="text-neutral-200">{result.seniority_advertised}</span>
              </p>
              <p className="text-sm text-neutral-400">
                Real estimate: <span className="text-neutral-200">{result.seniority_estimated_real}</span>
              </p>
            </div>

            {result.red_flags.length > 0 && (
              <div className="p-4 rounded-lg bg-neutral-900 border border-red-900/50">
                <h2 className="font-semibold mb-2 text-red-400">Red flags</h2>
                <ul className="space-y-1 text-sm text-neutral-300 list-disc list-inside">
                  {result.red_flags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.buzzwords_detected.length > 0 && (
              <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700">
                <h2 className="font-semibold mb-2">Buzzwords</h2>
                <div className="flex flex-wrap gap-2">
                  {result.buzzwords_detected.map((word, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-yellow-900/30 text-yellow-300 text-sm">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}