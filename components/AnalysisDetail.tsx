"use client";

import { useState } from "react";
import CompareCvButton from "./CompareCvButton";
import Section from "./Section";
import { splitTitle } from "@/lib/types";
import type { JobAnalysis } from "@/lib/types";

export default function AnalysisDetail({
  job,
  showOriginal = true,
}: {
  job: JobAnalysis;
  showOriginal?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { body } = splitTitle(job.raw_job_text);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked by the browser — not worth interrupting the user.
    }
  };

  return (
    <div className="space-y-4">
      <Section title="Seniority">
        <p className="text-sm text-neutral-400">
          Advertised:{" "}
          <span className="text-neutral-200">{job.seniority_advertised}</span>
        </p>
        <p className="text-sm text-neutral-400 mt-1">
          Real estimate:{" "}
          <span className="text-neutral-200">
            {job.seniority_estimated_real}
          </span>
        </p>
      </Section>

      {job.technologies_required.length > 0 && (
        <Section title="Required technologies">
          <div className="flex flex-wrap gap-2">
            {job.technologies_required.map((tech, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded bg-blue-900/40 text-blue-300 text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </Section>
      )}

      {job.red_flags.length > 0 && (
        <Section title="Red flags" tone="red">
          <ul className="space-y-1 text-sm text-neutral-300 list-disc list-inside">
            {job.red_flags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </Section>
      )}

      {job.buzzwords_detected.length > 0 && (
        <Section title="Buzzwords">
          <div className="flex flex-wrap gap-2">
            {job.buzzwords_detected.map((word, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded bg-yellow-900/30 text-yellow-300 text-sm"
              >
                {word}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section title="CV match">
        <CompareCvButton jobId={job.id} />
      </Section>

      {showOriginal && (
        <Section
          title="Original posting"
          action={
            <button
              onClick={handleCopy}
              className="text-xs text-neutral-500 hover:text-neutral-200"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          }
        >
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-400 max-h-56 overflow-y-auto">
            {body}
          </pre>
        </Section>
      )}
    </div>
  );
}
