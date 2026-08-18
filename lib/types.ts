export type JobAnalysis = {
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

export const CATEGORIES = [
  { value: "apply", label: "Apply!" },
  { value: "red_flag", label: "Red Flag!" },
  { value: "not_for_me", label: "Not for me!" },
] as const;

export const categoryBadge: Record<string, string> = {
  apply: "bg-green-900/40 text-green-300 border-green-700",
  red_flag: "bg-red-900/40 text-red-300 border-red-700",
  not_for_me: "bg-neutral-800 text-neutral-400 border-neutral-600",
};

export const categoryButton: Record<string, string> = {
  apply: "bg-green-900/30 text-green-300 hover:bg-green-900/50",
  red_flag: "bg-red-900/30 text-red-300 hover:bg-red-900/50",
  not_for_me: "bg-neutral-800 text-neutral-400 hover:bg-neutral-700",
};

// Fixed locale and timezone so the server and client render the same string.
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// The decode route has no title column to write to, so it stores Claude's
// one-line title as the first line of raw_job_text, separated from the pasted
// advert by a blank line. Every consumer splits it back out here.
export function splitTitle(rawJobText: string) {
  const text = rawJobText.trim();
  const match = /^(.{1,120}?)\r?\n\s*\r?\n([\s\S]+)$/.exec(text);

  if (!match) return { title: null as string | null, body: text };

  return { title: match[1].trim(), body: match[2].trim() };
}
