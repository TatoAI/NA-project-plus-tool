import { signup } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthForm
      title="Create your account"
      action={signup}
      submitLabel="Sign up"
      error={error}
      altHref="/login"
      altText="Already have an account? Log in"
    />
  );
}
