"use client";

import { useActionState, useState } from "react";
import { Button, Card, Field, FormError, Input, Select, Spinner } from "@/components/ui";
import { RoleBadge } from "@/components/status-badge";
import {
  inviteMember,
  changeRole,
  removeMember,
  revokeInvite,
  type InviteState,
} from "@/app/(app)/members/actions";

export interface MemberRow {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  isSelf: boolean;
}

export interface InviteRow {
  id: string;
  email: string;
  role: string;
  token: string;
}

export function MembersAdmin({ members, invites }: { members: MemberRow[]; invites: InviteRow[] }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteMember, {});
  const [copied, setCopied] = useState<string | null>(null);

  function copy(token: string) {
    navigator.clipboard?.writeText(token);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="border-b border-line bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Member</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {members.map((m) => (
                  <tr key={m.membershipId} className="transition-colors hover:bg-surface-2">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-wash text-xs font-semibold text-accent-ink">
                          {initials(m.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-ink">
                            {m.name}{" "}
                            {m.isSelf && <span className="text-xs font-normal text-faint">(you)</span>}
                          </div>
                          <div className="truncate text-xs text-muted">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {m.isSelf ? (
                        <RoleBadge role={m.role} />
                      ) : (
                        <form action={changeRole}>
                          <input type="hidden" name="membershipId" value={m.membershipId} />
                          <Select
                            name="role"
                            defaultValue={m.role}
                            onChange={(e) => e.currentTarget.form?.requestSubmit()}
                            className="w-36"
                          >
                            <option value="requester">Requester</option>
                            <option value="approver">Approver</option>
                            <option value="admin">Admin</option>
                          </Select>
                        </form>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!m.isSelf && (
                        <form action={removeMember}>
                          <input type="hidden" name="membershipId" value={m.membershipId} />
                          <input type="hidden" name="userId" value={m.userId} />
                          <button className="rounded px-1 text-xs font-medium text-rejected-fg transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            Remove
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {invites.length > 0 && (
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">Pending invitations</h2>
            <ul className="divide-y divide-line">
              {invites.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 py-2.5 text-sm first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-ink-soft">{i.email}</span>
                    <RoleBadge role={i.role} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copy(i.token)}
                      className="rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                    >
                      {copied === i.token ? "copied!" : "copy code"}
                    </button>
                    <form action={revokeInvite}>
                      <input type="hidden" name="inviteId" value={i.id} />
                      <button className="rounded px-1 text-xs font-medium text-rejected-fg transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        Revoke
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Card className="h-fit p-5">
        <h2 className="text-sm font-semibold text-ink">Invite a member</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Generates an invite code. Share it with the person — they redeem it after signing up.
        </p>
        <form action={action} className="mt-4 space-y-3">
          <Field label="Email">
            <Input name="email" type="email" required placeholder="teammate@company.com" />
          </Field>
          <Field label="Role">
            <Select name="role" defaultValue="requester">
              <option value="requester">Requester</option>
              <option value="approver">Approver</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <FormError message={state?.error} />
          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Spinner />}
            {pending ? "Creating…" : "Create invite"}
          </Button>
        </form>
        {state?.token && (
          <div className="mt-4 rounded-lg border border-approved-line bg-approved-bg p-3 text-sm">
            <p className="font-medium text-approved-fg">Invite for {state.email}:</p>
            <button
              onClick={() => copy(state.token!)}
              className="mt-2 block w-full break-all rounded-md bg-surface px-2 py-1.5 text-left font-mono text-xs text-ink-soft ring-1 ring-inset ring-approved-line transition-colors hover:bg-surface-2"
            >
              {copied === state.token ? "copied to clipboard!" : state.token}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "·";
}
