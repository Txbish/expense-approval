import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui";
import { signUp } from "./actions";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Then create or join an organization</p>
        </div>
        <Card className="p-6">
          <AuthForm action={signUp} mode="signup" />
        </Card>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
