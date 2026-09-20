"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ name, description: String(formData.get("description") ?? "").trim() || null })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create project");
  redirect(`/dashboard/projects/${data.id}`);
}

export async function deleteDocument(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("documents").delete().eq("id", String(formData.get("id")));
  revalidatePath("/dashboard", "layout");
}

export async function deleteProject(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", String(formData.get("id")));
  redirect("/dashboard");
}
