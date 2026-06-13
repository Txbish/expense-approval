import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { signUp } from "./actions";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Get started"
      title="create your account."
      subtitle="Then create or join an organization."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm action={signUp} mode="signup" />
    </AuthShell>
  );
}
