"use client"

import { useState } from "react";

type JobAnalysis = {
  id: string;
  raw_job_text: string;
  technologies_required: string[];
  seniority_advertised: string;
  seniority_estimated_real: string;
  red_flags: string[];
  buzzwords_detected: string[];
  category: string | null;
  created_at: string;
};

const categoryStyles: Record<string, string> = {
  apply: "bg-green-900/40 text-green-300 border-green-700",
  red_flag: "bg-red-900/40 text-red-300 border-red-700",
  not_for_me: "bg-neutral-800 text-neutral-400 border-neutral-600",
};

export default function JobCard({ job }: { job: JobAnalysis }) {
  const [category, setCategory] = useState(job.category);
  const [updating, setUpdating] = useState(false);

  const handleCategoryChange = async (newCategory: string) => {
    setUpdating(true);

    const res = await fetch(`/api/jobs/${job.id}/category`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: newCategory }),
    });

    if (res.ok) {
      setCategory(newCategory);
    }

    setUpdating(false);
  };

  const preview = job.raw_job_text.slice(0, 80) + "...";

  return (
    <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700 space-y-3">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-sm text-neutral-300">{preview}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {job.seniority_advertised} → estimate: {job.seniority_estimated_real}
          </p>
        </div>

        {category && (
          <span
            className={`px-2 py-1 rounded text-xs border shrink-0 ${categoryStyles[category]}`}
          >
            {category.replace("_", " ")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {job.technologies_required.slice(0, 5).map((tech, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 text-xs"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-neutral-800">
        <button
          onClick={() => handleCategoryChange("apply")}
          disabled={updating}
          className="px-3 py-1 rounded text-xs bg-green-900/30 text-green-300 hover:bg-green-900/50 disabled:opacity-50"
        >
          Apply!
        </button>
        <button
          onClick={() => handleCategoryChange("red_flag")}
          disabled={updating}
          className="px-3 py-1 rounded text-xs bg-red-900/30 text-red-300 hover:bg-red-900/50 disabled:opacity-50"
        >
          Red Flag!
        </button>
        <button
          onClick={() => handleCategoryChange("not_for_me")}
          disabled={updating}
          className="px-3 py-1 rounded text-xs bg-neutral-800 text-neutral-400 hover:bg-neutral-700 disabled:opacity-50"
        >
          Not for me!
        </button>
      </div>
    </div>
  );
}