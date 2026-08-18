import { createClient } from "@/lib/supabase/server";
import CvUploader, { type CvSummary } from "@/components/CvUploader";

// The upload route stores the file as `${user.id}/${Date.now()}-${file.name}`.
function displayName(filePath: string) {
  const base = filePath.split("/").pop() ?? filePath;
  return base.replace(/^\d+-/, "");
}

type CvRow = {
  file_path: string;
  extracted_text: string;
  // The timestamp column is named uploaded_at in the live table, but the
  // README's schema says created_at — read whichever is present.
  uploaded_at?: string | null;
  created_at?: string | null;
};

const PREVIEW_CHARS = 1500;

export default async function Profile() {
  const supabase = await createClient();

  // Row Level Security scopes this to the signed-in user, and the upload route
  // keeps at most one CV per user.
  const { data } = await supabase.from("cvs").select("*").limit(1);
  const row = (data?.[0] ?? null) as CvRow | null;

  const cv: CvSummary | null = row
    ? {
        fileName: displayName(row.file_path),
        uploadedAt: row.uploaded_at ?? row.created_at ?? null,
        charCount: row.extracted_text.length,
        preview: row.extracted_text.slice(0, PREVIEW_CHARS),
      }
    : null;

  return (
    <main className="flex-1 bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">My CV</h1>
          <p className="text-sm text-neutral-400">
            Upload your CV as a PDF. Its text is extracted once and used to
            score you against any job posting you analyse.
          </p>
        </div>

        <CvUploader cv={cv} />
      </div>
    </main>
  );
}
