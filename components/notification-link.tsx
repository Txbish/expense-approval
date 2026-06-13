"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTransition } from "react";
import { markRead } from "@/app/(app)/actions";

/**
 * A notification row that links to its request and marks itself read on open.
 * The read write is fired in a transition so navigation isn't blocked on it;
 * the action revalidates the layout, so the unread badge updates on return.
 */
export function NotificationLink({
  id,
  href,
  unread,
  className,
  children,
}: {
  id: string;
  href: string;
  unread: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [, startTransition] = useTransition();
  return (
    <Link
      href={href}
      onClick={() => {
        if (unread) startTransition(() => markRead(id));
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
