import Link from "next/link";
import { DocumentList } from "@/components/document-list";
import { SearchBox } from "@/components/search-box";
import { UploadForm } from "@/components/upload-form";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, description")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">General context</h2>
        <p className="text-sm text-zinc-600">
          Brand and voice guidelines, FAQs, and anything else that applies to all your projects (PDF or DOCX).
        </p>
        <UploadForm />
        <DocumentList projectId={null} />
        <SearchBox />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Projects</h2>
        <form action={createProject} className="flex flex-wrap gap-2">
          <input name="name" required placeholder="Project name"
            className="rounded border border-zinc-300 px-3 py-2 text-sm" />
          <input name="description" placeholder="Description (optional)"
            className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm" />
          <button className="rounded bg-zinc-900 px-3 py-2 text-sm text-white">Create project</button>
        </form>
        {projects?.length ? (
          <ul className="divide-y divide-zinc-200 rounded border border-zinc-200">
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/projects/${p.id}`} className="block p-3 hover:bg-zinc-50">
                  <span className="font-medium">{p.name}</span>
                  {p.description && <span className="ml-2 text-sm text-zinc-500">{p.description}</span>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No projects yet.</p>
        )}
      </section>
    </div>
  );
}
