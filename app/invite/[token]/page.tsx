import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { AcceptInvite } from "@/components/accept-invite";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">You&apos;re invited</h1>
          <p className="mt-1 text-sm text-slate-500">Join an organization on Approvals.</p>
        </div>
        <Card className="p-6">
          {user ? (
            <AcceptInvite token={token} />
          ) : (
            <div className="space-y-3 text-center text-sm text-slate-600">
              <p>Sign in or create an account to accept this invitation.</p>
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
                >
                  Sign up
                </Link>
              </div>
              <p className="text-xs text-slate-400">Then return to this link to join.</p>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
