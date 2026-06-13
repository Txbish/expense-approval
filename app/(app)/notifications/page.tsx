import Link from "next/link";
import { getAppContext } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { Button, EmptyState, PageHeader } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { markAllRead } from "@/app/(app)/actions";
import type { AppNotification } from "@/lib/types";

export default async function NotificationsPage() {
  const ctx = (await getAppContext())!;
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("org_id", ctx.org.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const notifications = (data ?? []) as AppNotification[];
  const hasUnread = notifications.some((n) => !n.read_at);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        actions={
          hasUnread && (
            <form action={markAllRead}>
              <Button type="submit" variant="secondary">
                Mark all read
              </Button>
            </form>
          )
        }
      />
      {notifications.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
              <path d="M10.5 20a1.8 1.8 0 0 0 3 0" />
            </svg>
          }
          title="You're all caught up"
          description="Updates on your requests and decisions to review will show up here."
        />
      ) : (
        <div className="divide-y divide-mist/70 overflow-hidden rounded-2xl border border-mist bg-cream">
          {notifications.map((n) => {
            const body = (
              <div className="flex items-start gap-3 px-5 py-4">
                {!n.read_at ? (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue" aria-label="Unread" />
                ) : (
                  <span className="mt-1.5 h-2 w-2 shrink-0" />
                )}
                <div>
                  <p className={n.read_at ? "text-field text-storm/70" : "text-field font-medium text-ink"}>{n.body}</p>
                  <p className="mt-0.5 text-xs tabular text-storm/55">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            );
            return n.request_id ? (
              <Link
                key={n.id}
                href={`/requests/${n.request_id}`}
                className="block transition-colors hover:bg-ink/3"
              >
                {body}
              </Link>
            ) : (
              <div key={n.id}>{body}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
