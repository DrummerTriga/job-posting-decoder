"use client";

import CategoryButtons from "./CategoryButtons";
import { categoryBadge, formatDate, splitTitle } from "@/lib/types";
import type { JobAnalysis } from "@/lib/types";

export default function JobCard({
  job,
  updating,
  onOpen,
  onCategoryChange,
}: {
  job: JobAnalysis;
  updating: boolean;
  onOpen: () => void;
  onCategoryChange: (category: string) => void;
}) {
  const { title, body } = splitTitle(job.raw_job_text);

  return (
    <div className="group p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-colors space-y-3">
      <div className="flex justify-between items-start gap-4">
        <button
          onClick={onOpen}
          className="text-left min-w-0 flex-1 cursor-pointer"
          aria-label="Open full analysis"
        >
          {title && (
            <p className="font-semibold text-neutral-100 truncate">{title}</p>
          )}
          <p
            className={`text-sm text-neutral-400 group-hover:text-neutral-300 ${
              title ? "line-clamp-1 mt-0.5" : "line-clamp-2 text-neutral-300"
            }`}
          >
            {body}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {formatDate(job.created_at)} · {job.seniority_advertised} → estimate:{" "}
            {job.seniority_estimated_real}
          </p>
        </button>

        {job.category && (
          <span
            className={`px-2 py-1 rounded text-xs border shrink-0 ${categoryBadge[job.category]}`}
          >
            {job.category.replace("_", " ")}
          </span>
        )}
      </div>

      {job.technologies_required.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.technologies_required.slice(0, 5).map((tech, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 text-xs"
            >
              {tech}
            </span>
          ))}
          {job.technologies_required.length > 5 && (
            <span className="px-2 py-0.5 text-xs text-neutral-500">
              +{job.technologies_required.length - 5} more
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800">
        <CategoryButtons
          category={job.category}
          updating={updating}
          onChange={onCategoryChange}
        />

        <button
          onClick={onOpen}
          className="px-3 py-1 rounded text-xs text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
        >
          View details →
        </button>
      </div>
    </div>
  );
}
