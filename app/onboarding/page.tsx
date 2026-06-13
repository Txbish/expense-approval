import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForms } from "@/components/onboarding-forms";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Already a member somewhere? Skip onboarding.
  const { data: memberships } = await supabase.from("memberships").select("id").limit(1);
  if (memberships && memberships.length > 0) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a new organization, or join one you&apos;ve been invited to.
        </p>
      </div>
      <OnboardingForms />
      <form action="/auth/signout" method="post" className="mt-8 text-center">
        <button className="text-sm text-slate-400 hover:text-slate-600">Sign out</button>
      </form>
    </main>
  );
}
