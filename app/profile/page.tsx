"use client";

import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function Profile() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your CV</h1>
          <LogoutButton />
        </div>

        <p className="text-neutral-400 text-sm">
          Upload your CV as a PDF. It will be used to compare against job
          postings you analyze.
        </p>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-neutral-800 file:text-neutral-200"
        />

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload CV"}
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && (
          <p className="text-green-400 text-sm">
            CV uploaded successfully!
          </p>
        )}
      </div>
    </main>
  );
}