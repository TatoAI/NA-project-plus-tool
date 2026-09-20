import { deleteDocument } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

export async function DocumentList({ projectId }: { projectId: string | null }) {
  const supabase = await createClient();
  let query = supabase.from("documents").select("id, filename, status, error, created_at").order("created_at", { ascending: false });
  query = projectId ? query.eq("project_id", projectId) : query.is("project_id", null);
  const { data: docs } = await query;

  if (!docs?.length) return <p className="text-sm text-zinc-500">Nothing uploaded yet.</p>;

  return (
    <ul className="divide-y divide-zinc-200 rounded border border-zinc-200">
      {docs.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-3 p-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium">{d.filename}</p>
            {d.error && <p className="text-xs text-red-700">{d.error}</p>}
          </div>
          <span className="text-xs text-zinc-500">{d.status}</span>
          <form action={deleteDocument}>
            <input type="hidden" name="id" value={d.id} />
            <button className="text-xs text-red-700 underline">Delete</button>
          </form>
        </li>
      ))}
    </ul>
  );
}
