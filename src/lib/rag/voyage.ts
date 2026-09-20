const VOYAGE_URL = "https://api.voyageai.com/v1";
const EMBED_MODEL = process.env.VOYAGE_EMBED_MODEL ?? "voyage-3.5";
const RERANK_MODEL = process.env.VOYAGE_RERANK_MODEL ?? "rerank-2.5";
const EMBED_BATCH = 64;

async function voyage<T>(path: string, body: unknown): Promise<T> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) throw new Error("VOYAGE_API_KEY is not set in .env.local");
  const res = await fetch(`${VOYAGE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Voyage ${path} failed (${res.status}): ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function embed(texts: string[], inputType: "document" | "query"): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH) {
    const { data } = await voyage<{ data: { embedding: number[] }[] }>("/embeddings", {
      input: texts.slice(i, i + EMBED_BATCH),
      model: EMBED_MODEL,
      input_type: inputType,
    });
    out.push(...data.map((d) => d.embedding));
  }
  return out;
}

export async function rerank<T extends { content: string }>(
  query: string,
  candidates: T[],
  topK: number,
): Promise<(T & { score: number })[]> {
  if (candidates.length === 0) return [];
  const { data } = await voyage<{ data: { index: number; relevance_score: number }[] }>("/rerank", {
    query,
    documents: candidates.map((c) => c.content),
    model: RERANK_MODEL,
    top_k: topK,
  });
  return data.map((r) => ({ ...candidates[r.index], score: r.relevance_score }));
}
