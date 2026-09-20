import type { SupabaseClient } from "@supabase/supabase-js";
import { embed, rerank } from "./voyage";

export type RetrievedChunk = {
  id: string;
  document_id: string;
  project_id: string | null;
  content: string;
  similarity: number;
  score: number;
};

// Two-stage retrieval: wide vector search (general + project context, current
// user only), then a reranker to pick the best few. Pass this to the generation step.
export async function retrieveContext(
  supabase: SupabaseClient,
  query: string,
  projectId: string | null,
  { candidates = 30, topK = 8 } = {},
): Promise<RetrievedChunk[]> {
  const [queryEmbedding] = await embed([query], "query");

  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: candidates,
    filter_project: projectId,
  });
  if (error) throw new Error(error.message);

  return rerank(query, data ?? [], topK) as Promise<RetrievedChunk[]>;
}
