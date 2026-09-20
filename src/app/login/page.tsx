import { login } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  return (
    <AuthForm
      title="Log in"
      action={login}
      submitLabel="Log in"
      error={error}
      message={message}
      altHref="/signup"
      altText="No account? Sign up"
    />
  );
}
