"use client";

import { useState } from "react";

type Result = { id: string; content: string; score: number };

export function SearchBox({ projectId }: { projectId?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, project_id: projectId ?? null }),
    });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) setError(body.error ?? "Search failed");
    else setResults(body.results);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} required
          placeholder="Test retrieval: ask something your documents should answer"
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm" />
        <button disabled={busy} className="rounded bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50">
          {busy ? "Searching…" : "Search"}
        </button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {results?.length === 0 && <p className="text-sm text-zinc-500">No matching context found.</p>}
      <ul className="space-y-2">
        {results?.map((r) => (
          <li key={r.id} className="rounded border border-zinc-200 p-3 text-sm">
            <span className="text-xs text-zinc-500">relevance {r.score.toFixed(3)}</span>
            <p className="mt-1 whitespace-pre-wrap">{r.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
