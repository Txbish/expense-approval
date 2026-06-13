import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "@/components/auth-shell";
import { AcceptInvite } from "@/components/accept-invite";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthShell
      title="You're invited"
      subtitle="Join an organization on Approvals."
    >
      {user ? (
        <AcceptInvite token={token} />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Sign in or create an account to accept this invitation.
          </p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="inline-flex h-9 flex-1 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-medium text-ink-soft shadow-sm transition-colors hover:bg-surface-2 hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-contrast shadow-sm transition-colors hover:bg-accent-hover"
            >
              Sign up
            </Link>
          </div>
          <p className="text-xs text-faint">Then return to this link to join.</p>
        </div>
      )}
    </AuthShell>
  );
}
