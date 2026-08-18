"use client";

import { useState } from "react";
import JobCard from "./JobCard";
import JobModal from "./JobModal";
import { updateJobCategory } from "@/lib/jobs";
import type { JobAnalysis } from "@/lib/types";

export default function JobList({ initialJobs }: { initialJobs: JobAnalysis[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [openId, setOpenId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const openJob = jobs.find((j) => j.id === openId) ?? null;

  const handleCategoryChange = async (id: string, category: string) => {
    setUpdatingId(id);
    setError("");

    const result = await updateJobCategory(id, category);

    if (result.ok) {
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, category } : j)));
    } else {
      setError(result.error);
    }

    setUpdatingId(null);
  };

  return (
    <>
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            updating={updatingId === job.id}
            onOpen={() => setOpenId(job.id)}
            onCategoryChange={(category) =>
              handleCategoryChange(job.id, category)
            }
          />
        ))}
      </div>

      {openJob && (
        <JobModal
          key={openJob.id}
          job={openJob}
          updating={updatingId === openJob.id}
          onClose={() => setOpenId(null)}
          onCategoryChange={(category) =>
            handleCategoryChange(openJob.id, category)
          }
        />
      )}
    </>
  );
}
