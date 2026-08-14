import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import JobCard from "@/components/JobCard";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("job_analyses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-3 items-center">
            <a href="/analyze" className="text-sm underline text-neutral-400">
              + New analysis
            </a>
            <LogoutButton />
          </div>
        </div>

        {(!jobs || jobs.length === 0) && (
          <p className="text-neutral-500 text-sm">
            No job postings analyzed yet.
          </p>
        )}

        <div className="space-y-3">
          {jobs?.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </main>
  );
}