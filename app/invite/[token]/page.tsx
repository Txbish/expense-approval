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
      eyebrow="Invitation"
      title="you're invited."
      subtitle="Join an organization on approvals."
    >
      {user ? (
        <AcceptInvite token={token} />
      ) : (
        <div className="space-y-4">
          <p className="text-caption text-storm/75">
            Sign in or create an account to accept this invitation.
          </p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-mist/60 bg-parchment px-5 text-field font-medium text-ink transition-colors hover:bg-mist/40"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-ink px-5 text-field font-medium text-cream transition-colors hover:bg-storm"
            >
              Sign up
            </Link>
          </div>
          <p className="text-2xs uppercase tracking-[0.12em] text-storm/55">
            Then return to this link to join.
          </p>
        </div>
      )}
    </AuthShell>
  );
}
