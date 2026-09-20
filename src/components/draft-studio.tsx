"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FORMATS, type FormatKey } from "@/lib/drafting/formats";

export function DraftStudio({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [format, setFormat] = useState<FormatKey>("linkedin_post");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOutput("");

    const res = await fetch("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief, format, project_id: projectId ?? null }),
    });

    if (!res.ok || !res.body) {
      setError((await res.json().catch(() => null))?.error ?? "Drafting failed");
      setBusy(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      setOutput((prev) => prev + decoder.decode(value, { stream: true }));
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="space-y-2">
        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} required rows={3}
          placeholder="What should it be about? e.g. Announce our new onboarding checklist and why it matters"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm" />
        <div className="flex flex-wrap gap-2">
          <select value={format} onChange={(e) => setFormat(e.target.value as FormatKey)}
            className="rounded border border-zinc-300 px-3 py-2 text-sm">
            {Object.entries(FORMATS).map(([key, f]) => (
              <option key={key} value={key}>{f.label}</option>
            ))}
          </select>
          <button disabled={busy} className="rounded bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50">
            {busy ? "Writing…" : "Write draft"}
          </button>
        </div>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {output && (
        <div className="whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-4 text-sm">{output}</div>
      )}
    </div>
  );
}
