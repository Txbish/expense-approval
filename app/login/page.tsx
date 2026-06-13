import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { signIn } from "./actions";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Sign in"
      title="welcome back."
      subtitle="Enter your credentials to access the dashboard."
      footer={
        <>
          Need access?{" "}
          <Link href="/signup" className="font-medium text-blue hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm action={signIn} mode="login" />
    </AuthShell>
  );
}
