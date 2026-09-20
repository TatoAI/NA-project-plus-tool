"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UploadForm({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (projectId) data.set("project_id", projectId);

    setBusy(true);
    setError(null);
    const res = await fetch("/api/documents", { method: "POST", body: data });
    setBusy(false);

    if (!res.ok) {
      setError((await res.json().catch(() => null))?.error ?? "Upload failed");
    } else {
      form.reset();
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
      <input name="file" type="file" accept=".pdf,.docx" required className="text-sm" />
      <button disabled={busy} className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50">
        {busy ? "Processing…" : "Upload"}
      </button>
      {error && <p className="w-full text-sm text-red-700">{error}</p>}
    </form>
  );
}
