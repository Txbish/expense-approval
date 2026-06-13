import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { signIn } from "./actions";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back to your workspace."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-accent-ink hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm action={signIn} mode="login" />
    </AuthShell>
  );
}
