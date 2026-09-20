import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-4">
        <Link href="/dashboard" className="text-lg font-semibold">Content Engine</Link>
        <form action={logout} className="flex items-center gap-3 text-sm">
          <span className="text-zinc-500">{user?.email}</span>
          <button className="underline">Log out</button>
        </form>
      </header>
      {children}
    </div>
  );
}
