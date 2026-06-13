import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForms } from "@/components/onboarding-forms";
import { Wordmark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <main className="min-h-screen bg-bg">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Wordmark className="text-ink" />
        <ThemeToggle className="text-muted hover:bg-surface-2 hover:text-ink" />
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <div className="mb-10 max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Set up your workspace</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Create a new organization to start collecting expense requests, or join one
            you&apos;ve been invited to with a code.
          </p>
        </div>
        <OnboardingForms />
        <form action="/auth/signout" method="post" className="mt-10">
          <button className="text-sm text-muted transition-colors hover:text-ink">
            ← Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
