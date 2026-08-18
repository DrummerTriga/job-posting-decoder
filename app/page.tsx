import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LandingDemo from "@/components/LandingDemo";
import Stat from "@/components/Stat";
import { splitTitle } from "@/lib/types";
import { MODEL } from "@/lib/model";

type JobRow = {
  id: string;
  raw_job_text: string;
  seniority_advertised: string | null;
  seniority_estimated_real: string | null;
  category: string | null;
  created_at: string;
};

const categoryStyles: Record<string, string> = {
  apply: "bg-green-900/40 text-green-300 border-green-700",
  red_flag: "bg-red-900/40 text-red-300 border-red-700",
  not_for_me: "bg-neutral-800 text-neutral-400 border-neutral-600",
};

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-out visitors get the pitch; signed-in users get their own hub.
  if (!user) return <LandingPitch />;

  const [{ data: jobs }, { count: cvCount }] = await Promise.all([
    supabase
      .from("job_analyses")
      .select("id, raw_job_text, seniority_advertised, seniority_estimated_real, category, created_at")
      .order("created_at", { ascending: false })
      .returns<JobRow[]>(),
    supabase
      .from("cvs")
      .select("id", { count: "exact", head: true }),
  ]);

  const analyses = jobs ?? [];
  const counts = {
    total: analyses.length,
    apply: analyses.filter((j) => j.category === "apply").length,
    red_flag: analyses.filter((j) => j.category === "red_flag").length,
    not_for_me: analyses.filter((j) => j.category === "not_for_me").length,
    untagged: analyses.filter((j) => !j.category).length,
  };
  const hasCv = (cvCount ?? 0) > 0;

  return (
    <main className="flex-1 bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <section className="space-y-2">
          <p className="text-sm text-neutral-500">Welcome back</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {counts.total === 0
              ? "Let's decode your first job posting."
              : `You've decoded ${counts.total} posting${counts.total === 1 ? "" : "s"}.`}
          </h1>
          <p className="text-neutral-400 max-w-2xl">
            {counts.untagged > 0
              ? `${counts.untagged} of them ${counts.untagged === 1 ? "is" : "are"} still waiting for a decision.`
              : "Everything you've analysed is tagged. Nice."}
          </p>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Analysed" value={counts.total} />
          <Stat label="Apply" value={counts.apply} tone="green" />
          <Stat label="Red flag" value={counts.red_flag} tone="red" />
          <Stat label="Not for me" value={counts.not_for_me} />
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <ActionCard
            href="/analyze"
            emoji="🔍"
            title="Decode a posting"
            body="Paste the text and get technologies, real seniority, red flags and buzzwords."
          />
          <ActionCard
            href="/dashboard"
            emoji="🗂"
            title="Your history"
            body={
              counts.total === 0
                ? "Nothing saved yet — your analyses will show up here."
                : `Revisit and tag all ${counts.total} saved analyses.`
            }
          />
          <ActionCard
            href="/profile"
            emoji={hasCv ? "📄" : "⬆️"}
            title={hasCv ? "Your CV" : "Upload your CV"}
            body={
              hasCv
                ? "Uploaded. You can compare it against any posting from the dashboard."
                : "Upload a PDF to unlock match scores against every posting you analyse."
            }
            highlight={!hasCv}
          />
        </section>

        {analyses.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Recent analyses</h2>
              <Link
                href="/dashboard"
                className="text-sm text-neutral-400 hover:text-neutral-100 underline"
              >
                See all
              </Link>
            </div>

            <div className="space-y-2">
              {analyses.slice(0, 3).map((job) => {
                const { title, body } = splitTitle(job.raw_job_text);

                return (
                <Link
                  key={job.id}
                  href="/dashboard"
                  className="block p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      {title && (
                        <p className="font-semibold text-neutral-100 truncate">
                          {title}
                        </p>
                      )}
                      <p className="text-sm text-neutral-400 truncate">
                        {body}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {job.seniority_advertised} → estimate:{" "}
                        {job.seniority_estimated_real}
                      </p>
                    </div>
                    {job.category && (
                      <span
                        className={`px-2 py-1 rounded text-xs border shrink-0 ${categoryStyles[job.category]}`}
                      >
                        {job.category.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function LandingPitch() {
  return (
    <main className="flex-1 bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-20">
        <section className="space-y-6 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs bg-neutral-900 border border-neutral-800 text-neutral-400">
            Powered by {MODEL}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Cut through the corporate speak.
          </h1>
          <p className="text-lg text-neutral-400">
            Paste a job posting and find out what they&apos;re really asking
            for: the actual tech stack, the seniority they want versus the one
            they advertise, the red flags, and every buzzword called out by
            name.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-lg bg-neutral-100 text-neutral-900 font-medium hover:bg-white"
            >
              Get started — it&apos;s free
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-900"
            >
              I already have an account
            </Link>
          </div>
          <a
            href="#demo"
            className="inline-block text-sm text-neutral-500 hover:text-neutral-300 underline"
          >
            Or see it in action first ↓
          </a>
        </section>

        <section id="demo" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold tracking-tight">
            See it on a real-world posting
          </h2>
          <p className="text-neutral-400 max-w-2xl">
            Pick one of these two all-too-familiar adverts and decode it. These
            are worked examples — sign up to run it on the posting that&apos;s
            actually sitting in your tab.
          </p>
          <LandingDemo />
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Step
              n={1}
              title="Paste the posting"
              body="The whole advert, buzzwords and all. No formatting needed."
            />
            <Step
              n={2}
              title="Get the breakdown"
              body="Technologies, advertised versus real seniority, red flags explained, buzzwords named."
            />
            <Step
              n={3}
              title="Decide and track"
              body="Tag it Apply, Red Flag or Not for me. Everything stays in your dashboard."
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Upload your CV, get a match score
          </h2>
          <p className="text-neutral-400 max-w-2xl">
            Drop in a PDF once. From then on, any posting can be scored 0–100
            against your actual experience, with the matching skills and the
            gaps listed side by side — before you spend an evening on the
            application.
          </p>
          <Link
            href="/signup"
            className="inline-block px-5 py-2.5 rounded-lg bg-neutral-100 text-neutral-900 font-medium hover:bg-white"
          >
            Create your account
          </Link>
        </section>
      </div>
    </main>
  );
}

function ActionCard({
  href,
  emoji,
  title,
  body,
  highlight,
}: {
  href: string;
  emoji: string;
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block p-5 rounded-xl bg-neutral-900 border transition-colors hover:border-neutral-500 ${
        highlight ? "border-purple-800/70" : "border-neutral-800"
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <h2 className="font-semibold mt-2">{title}</h2>
      <p className="text-sm text-neutral-400 mt-1">{body}</p>
    </Link>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-neutral-800 text-sm text-neutral-300">
        {n}
      </span>
      <h3 className="font-semibold mt-3">{title}</h3>
      <p className="text-sm text-neutral-400 mt-1">{body}</p>
    </div>
  );
}
