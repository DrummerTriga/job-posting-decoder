"use client";

import { useState } from "react";

type ComparisonResult = {
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  overall_assessment: string;
};

function scoreColor(score: number) {
  if (score >= 70) return "text-green-400 border-green-700 bg-green-900/20";
  if (score >= 45) return "text-yellow-400 border-yellow-700 bg-yellow-900/20";
  return "text-red-400 border-red-700 bg-red-900/20";
}

export default function CompareCvButton({ jobId }: { jobId: string }) {
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/compare-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobAnalysisId: jobId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Comparison failed.");
        return;
      }

      setResult(data);
      setExpanded(true);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2">
      {!result && (
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-3 py-1 rounded text-xs bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 disabled:opacity-50"
        >
          {loading ? "Comparing..." : "Compare with my CV"}
        </button>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {result && (
        <div className="mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`px-3 py-1 rounded text-xs border ${scoreColor(result.match_score)}`}
          >
            Match: {result.match_score}% {expanded ? "▲" : "▼"}
          </button>

          {expanded && (
            <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
              <p className="text-sm text-neutral-300">
                {result.overall_assessment}
              </p>

              <div>
                <p className="text-xs text-neutral-500 mb-1">Matching skills</p>
                <div className="flex flex-wrap gap-1">
                  {result.matching_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-green-900/30 text-green-300 text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-neutral-500 mb-1">Missing skills</p>
                <div className="flex flex-wrap gap-1">
                  {result.missing_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-red-900/30 text-red-300 text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}