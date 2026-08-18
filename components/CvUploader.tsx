"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/types";

export type CvSummary = {
  fileName: string;
  uploadedAt: string | null;
  charCount: number;
  preview: string;
};

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function CvUploader({ cv }: { cv: CvSummary | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showText, setShowText] = useState(false);

  const selectFile = (candidate: File | null) => {
    setError("");
    setSuccess(false);

    if (!candidate) return;

    if (candidate.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }

    setFile(candidate);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess(false);

    // Construímos o FormData mencionado antes — o "cv" aqui tem de bater
    // certo com o formData.get("cv") que usámos na Route Handler.
    const formData = new FormData();
    formData.append("cv", file);

    try {
      const res = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
        // Nota: não definimos manualmente o header Content-Type aqui —
        // o browser trata disso sozinho quando o body é FormData,
        // incluindo um "boundary" técnico necessário para o servidor
        // conseguir separar as partes do ficheiro corretamente.
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }

      setSuccess(true);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      // Pulls the new CV status back from the server component above.
      router.refresh();
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {cv ? (
        <section className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-2xl">📄</span>
              <div className="min-w-0">
                <p className="font-medium truncate">{cv.fileName}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {cv.uploadedAt ? `Uploaded ${formatDate(cv.uploadedAt)} · ` : ""}
                  {cv.charCount.toLocaleString("en-GB")} characters extracted
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded text-xs border bg-green-900/40 text-green-300 border-green-700 shrink-0">
              on file
            </span>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => setShowText(!showText)}
              className="text-xs text-neutral-400 hover:text-neutral-100 underline"
            >
              {showText ? "Hide extracted text" : "Preview extracted text"}
            </button>
            <Link
              href="/dashboard"
              className="text-xs text-neutral-400 hover:text-neutral-100 underline"
            >
              Compare it against a posting →
            </Link>
          </div>

          {showText && (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-400 rounded-lg bg-neutral-950 border border-neutral-800 p-4 max-h-64 overflow-y-auto">
              {cv.preview}
              {cv.charCount > cv.preview.length && "\n\n…"}
            </pre>
          )}

          <p className="text-xs text-neutral-500 pt-1">
            This is the text Claude reads when scoring you against a posting. If
            it looks garbled, the PDF is likely image-based — try exporting it
            as text-based PDF.
          </p>
        </section>
      ) : (
        <section className="p-5 rounded-xl bg-neutral-900 border border-purple-800/70">
          <p className="font-medium">No CV on file yet.</p>
          <p className="text-sm text-neutral-400 mt-1">
            Upload one to unlock match scores on every posting you analyse.
          </p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">
          {cv ? "Replace your CV" : "Upload your CV"}
        </h2>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            selectFile(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`rounded-xl border border-dashed p-8 text-center transition-colors ${
            dragging
              ? "border-neutral-400 bg-neutral-900"
              : "border-neutral-700 bg-neutral-900/40"
          }`}
        >
          <p className="text-3xl">⬆️</p>
          <p className="text-sm text-neutral-300 mt-3">
            Drag a PDF here, or
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-2 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 text-sm hover:bg-neutral-700"
          >
            Choose a file
          </button>
          <p className="text-xs text-neutral-600 mt-3">PDF only</p>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </div>

        {file && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <p className="text-sm text-neutral-300 truncate min-w-0">
              {file.name}{" "}
              <span className="text-neutral-500">({formatSize(file.size)})</span>
            </p>
            <button
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              disabled={uploading}
              className="text-xs text-neutral-400 hover:text-neutral-100 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50"
        >
          {uploading
            ? "Uploading…"
            : cv
              ? "Replace CV"
              : "Upload CV"}
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && (
          <p className="text-green-400 text-sm">CV uploaded successfully!</p>
        )}

        {cv && (
          <p className="text-xs text-neutral-500">
            Uploading a new file replaces the current one — only the most recent
            CV is kept.
          </p>
        )}
      </section>
    </div>
  );
}
