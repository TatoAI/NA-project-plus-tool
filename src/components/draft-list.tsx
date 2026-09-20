import { createClient } from "@/lib/supabase/server";
import { FORMATS, isFormatKey } from "@/lib/drafting/formats";

export async function DraftList({ projectId }: { projectId: string | null }) {
  const supabase = await createClient();
  let query = supabase
    .from("drafts")
    .select("id, format, brief, content, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  query = projectId ? query.eq("project_id", projectId) : query.is("project_id", null);
  const { data: drafts } = await query;

  if (!drafts?.length) return <p className="text-sm text-zinc-500">No saved drafts yet.</p>;

  return (
    <ul className="space-y-2">
      {drafts.map((d) => (
        <li key={d.id}>
          <details className="rounded border border-zinc-200 p-3 text-sm">
            <summary className="cursor-pointer">
              <span className="font-medium">{isFormatKey(d.format) ? FORMATS[d.format].label : d.format}</span>
              <span className="ml-2 text-zinc-500">{d.brief.slice(0, 80)}</span>
            </summary>
            <p className="mt-3 whitespace-pre-wrap">{d.content}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
