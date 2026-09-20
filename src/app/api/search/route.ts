import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { retrieveContext } from "@/lib/rag/retrieve";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { query, project_id } = (await request.json()) as { query?: string; project_id?: string | null };
  if (!query?.trim()) return NextResponse.json({ error: "Query is required" }, { status: 400 });

  try {
    const results = await retrieveContext(supabase, query, project_id ?? null);
    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Search failed" }, { status: 500 });
  }
}
