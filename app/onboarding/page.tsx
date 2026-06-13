import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForms } from "@/components/onboarding-forms";
import { Wordmark } from "@/components/brand-mark";

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
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-mist px-5 py-4 sm:px-8">
        <Wordmark className="text-ink" />
        <form action="/auth/signout" method="post">
          <button className="text-2xs font-medium uppercase tracking-[0.12em] text-storm/60 transition-colors hover:text-ink">
            Sign out
          </button>
        </form>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <div className="mb-10 max-w-xl space-y-3">
          <p className="text-2xs font-medium uppercase tracking-[0.18em] text-storm/55">Onboarding</p>
          <h1 className="text-heading-sm lowercase text-ink">set up your workspace.</h1>
          <p className="text-body-sm text-storm/80">
            Create a new organization to start collecting expense requests, or join one
            you&apos;ve been invited to with a code.
          </p>
        </div>
        <OnboardingForms />
      </div>
    </main>
  );
}
