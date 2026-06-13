import Link from "next/link";
import { getAppContext } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { Card, Button } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { markAllRead } from "@/app/(app)/actions";
import type { AppNotification } from "@/lib/types";

export default async function NotificationsPage() {
  await getAppContext();
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const notifications = (data ?? []) as AppNotification[];
  const hasUnread = notifications.some((n) => !n.read_at);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
        {hasUnread && (
          <form action={markAllRead}>
            <Button type="submit" variant="secondary">
              Mark all read
            </Button>
          </form>
        )}
      </div>
      <Card className="divide-y divide-slate-100">
        {notifications.length === 0 && (
          <p className="p-6 text-sm text-slate-500">You&apos;re all caught up.</p>
        )}
        {notifications.map((n) => {
          const body = (
            <div className="flex items-start gap-3 px-5 py-3">
              {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
              <div className={n.read_at ? "pl-5" : ""}>
                <p className="text-sm text-slate-800">{n.body}</p>
                <p className="text-xs text-slate-400">{timeAgo(n.created_at)}</p>
              </div>
            </div>
          );
          return n.request_id ? (
            <Link key={n.id} href={`/requests/${n.request_id}`} className="block hover:bg-slate-50">
              {body}
            </Link>
          ) : (
            <div key={n.id}>{body}</div>
          );
        })}
      </Card>
    </div>
  );
}
