import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chunkText } from "@/lib/rag/chunk";
import { parseFile } from "@/lib/rag/parse";
import { embed } from "@/lib/rag/voyage";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 10 * 1024 * 1024;
const INSERT_BATCH = 100;

// Upload -> parse -> chunk -> embed -> store. All writes go through the caller's
// own Supabase client, so RLS guarantees the rows belong to them.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const projectId = (form.get("project_id") as string | null) || null;

  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is larger than 10 MB" }, { status: 413 });

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({ filename: file.name, project_id: projectId })
    .select("id")
    .single();
  if (docError || !doc) {
    return NextResponse.json({ error: docError?.message ?? "Could not create document" }, { status: 400 });
  }

  try {
    const text = await parseFile(file.name, Buffer.from(await file.arrayBuffer()));
    const chunks = chunkText(text);
    if (chunks.length === 0) throw new Error("No readable text found in this file.");

    const embeddings = await embed(chunks, "document");
    const rows = chunks.map((content, i) => ({
      document_id: doc.id,
      project_id: projectId,
      chunk_index: i,
      content,
      embedding: JSON.stringify(embeddings[i]),
    }));

    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const { error } = await supabase.from("chunks").insert(rows.slice(i, i + INSERT_BATCH));
      if (error) throw new Error(error.message);
    }

    await supabase.from("documents").update({ status: "ready" }).eq("id", doc.id);
    return NextResponse.json({ id: doc.id, chunks: chunks.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Processing failed";
    await supabase.from("chunks").delete().eq("document_id", doc.id);
    await supabase.from("documents").update({ status: "failed", error: message }).eq("id", doc.id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
