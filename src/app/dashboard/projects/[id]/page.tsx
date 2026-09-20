import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentList } from "@/components/document-list";
import { SearchBox } from "@/components/search-box";
import { UploadForm } from "@/components/upload-form";
import { createClient } from "@/lib/supabase/server";
import { deleteProject } from "../../actions";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("id, name, description").eq("id", id).maybeSingle();
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm underline">← All projects</Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {project.description && <p className="text-sm text-zinc-600">{project.description}</p>}
        </div>
        <form action={deleteProject}>
          <input type="hidden" name="id" value={project.id} />
          <button className="text-sm text-red-700 underline">Delete project</button>
        </form>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Project context</h2>
        <p className="text-sm text-zinc-600">
          Files here apply to this project only. Your general context is searched alongside them.
        </p>
        <UploadForm projectId={project.id} />
        <DocumentList projectId={project.id} />
        <SearchBox projectId={project.id} />
      </section>
    </div>
  );
}
