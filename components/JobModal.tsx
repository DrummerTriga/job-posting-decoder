"use client";

import { useEffect, useRef } from "react";
import AnalysisDetail from "./AnalysisDetail";
import CategoryButtons from "./CategoryButtons";
import { categoryBadge, formatDate, splitTitle } from "@/lib/types";
import type { JobAnalysis } from "@/lib/types";

export default function JobModal({
  job,
  updating,
  onClose,
  onCategoryChange,
}: {
  job: JobAnalysis;
  updating: boolean;
  onClose: () => void;
  onCategoryChange: (category: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { title } = splitTitle(job.raw_job_text);

  // Kept in a ref so the mount effect below never has to re-run.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // showModal() gives us the backdrop, focus trapping and inert background.
  // Closing is driven entirely from React state instead of the dialog's own
  // close/cancel events, which are not reliably emitted everywhere: every exit
  // (X, backdrop, Escape) calls onClose and the parent unmounts us.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (!dialog.open) dialog.showModal();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        // Clicks land on the dialog itself only when they hit the backdrop.
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[85vh] p-0 rounded-2xl bg-neutral-900 text-neutral-100 border border-neutral-700 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col max-h-[85vh]">
        <header className="flex items-start justify-between gap-4 p-5 border-b border-neutral-800 shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {title ?? "Analysis"}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Saved {formatDate(job.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {job.category && (
              <span
                className={`px-2 py-1 rounded text-xs border ${categoryBadge[job.category]}`}
              >
                {job.category.replace("_", " ")}
              </span>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100 text-sm"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="overflow-y-auto p-5">
          <AnalysisDetail job={job} />
        </div>

        <footer className="flex flex-wrap items-center gap-2 p-5 border-t border-neutral-800 shrink-0">
          <span className="text-xs text-neutral-500 mr-1">Tag it:</span>
          <CategoryButtons
            category={job.category}
            updating={updating}
            onChange={onCategoryChange}
          />
        </footer>
      </div>
    </dialog>
  );
}
