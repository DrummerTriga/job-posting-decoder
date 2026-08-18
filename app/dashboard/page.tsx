import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import JobList from "@/components/JobList";
import Stat from "@/components/Stat";
import type { JobAnalysis } from "@/lib/types";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("job_analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<JobAnalysis[]>();

  const analyses = jobs ?? [];
  const counts = {
    total: analyses.length,
    apply: analyses.filter((j) => j.category === "apply").length,
    red_flag: analyses.filter((j) => j.category === "red_flag").length,
    not_for_me: analyses.filter((j) => j.category === "not_for_me").length,
  };

  return (
    <main className="flex-1 bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-neutral-400">
              Every posting you&apos;ve decoded. Click one to see the full
              breakdown.
            </p>
          </div>
          <Link
            href="/analyze"
            className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-medium hover:bg-white shrink-0"
          >
            + New analysis
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-neutral-800 text-center space-y-3">
            <p className="text-4xl">🔍</p>
            <p className="text-neutral-300 font-medium">
              No job postings analysed yet.
            </p>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto">
              Paste your first advert and get the technologies, the real
              seniority, the red flags and the buzzwords in one go.
            </p>
            <Link
              href="/analyze"
              className="inline-block mt-2 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-medium hover:bg-white"
            >
              Decode a posting
            </Link>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Analysed" value={counts.total} />
              <Stat label="Apply" value={counts.apply} tone="green" />
              <Stat label="Red flag" value={counts.red_flag} tone="red" />
              <Stat label="Not for me" value={counts.not_for_me} />
            </section>

            <JobList initialJobs={analyses} />
          </>
        )}
      </div>
    </main>
  );
}
