import Link from "next/link";

type Props = {
  title: string;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  error?: string;
  message?: string;
  altHref: string;
  altText: string;
};

export function AuthForm({ title, action, submitLabel, error, message, altHref, altText }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded bg-green-50 p-2 text-sm text-green-700">{message}</p>}
        <label className="block text-sm">
          Email
          <input name="email" type="email" required autoComplete="email"
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" required minLength={6} autoComplete="current-password"
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2" />
        </label>
        <button className="w-full rounded bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-700">
          {submitLabel}
        </button>
        <p className="text-center text-sm text-zinc-600">
          <Link href={altHref} className="underline">{altText}</Link>
        </p>
      </form>
    </main>
  );
}
