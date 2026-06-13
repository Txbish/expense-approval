import Link from "next/link";
import { getAppContext } from "@/lib/context";
import { OnboardingForms } from "@/components/onboarding-forms";
import { PageHeader } from "@/components/ui";

export default async function NewOrgPage() {
  // Just guarantees an authenticated, onboarded user (layout already redirects
  // unauthenticated users). Adding an org reuses the first-run forms.
  await getAppContext();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-2xs font-medium uppercase tracking-[0.12em] text-storm/60 transition-colors hover:text-ink">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 5 7 10l5 5" />
        </svg>
        Back to dashboard
      </Link>

      <PageHeader
        eyebrow="Organizations"
        title="Add an organization"
        description="Create a new workspace, or join one you've been invited to. You'll switch into it automatically."
      />
      <OnboardingForms />
    </div>
  );
}
