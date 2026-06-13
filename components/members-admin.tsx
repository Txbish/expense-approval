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
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <div className="overflow-hidden rounded-2xl border border-mist bg-cream">
          {/* Cards until xl: the members column is only ~2/3 width on desktop,
              so the table needs xl before it fits without clipping the action. */}
          <ul className="divide-y divide-mist/70 xl:hidden">
            {members.map((m) => (
              <li key={m.membershipId} className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-2xs font-semibold uppercase text-cream">
                    {initials(m.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-ink">
                      {m.name}{" "}
                      {m.isSelf && <span className="text-xs font-normal text-storm/50">(you)</span>}
                    </div>
                    <div className="truncate text-xs text-storm/65">{m.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  {m.isSelf ? (
                    <RoleBadge role={m.role} />
                  ) : (
                    <form action={changeRole} className="min-w-0 flex-1">
                      <input type="hidden" name="membershipId" value={m.membershipId} />
                      <Select
                        name="role"
                        defaultValue={m.role}
                        submitOnChange
                        aria-label={`Role for ${m.name}`}
                        className="w-full max-w-[12rem]"
                      >
                        <option value="requester">Requester</option>
                        <option value="approver">Approver</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </form>
                  )}
                  {!m.isSelf && (
                    <form action={removeMember}>
                      <input type="hidden" name="membershipId" value={m.membershipId} />
                      <input type="hidden" name="userId" value={m.userId} />
                      <button className="inline-flex h-9 items-center rounded-md px-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40">
                        Remove
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* xl+: the members table */}
          <div className="hidden min-w-0 overflow-x-auto xl:block">
            <table className="w-full min-w-[32rem] text-sm">
              <thead className="border-b border-mist text-left">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-2xs [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-storm/60">
                  <th>Member</th>
                  <th>Role</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-mist/70">
                {members.map((m) => (
                  <tr key={m.membershipId} className="transition-colors hover:bg-ink/3">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-2xs font-semibold uppercase text-cream">
                          {initials(m.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-ink">
                            {m.name}{" "}
                            {m.isSelf && <span className="text-xs font-normal text-storm/50">(you)</span>}
                          </div>
                          <div className="truncate text-xs text-storm/65">{m.email}</div>
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
                            submitOnChange
                            aria-label={`Role for ${m.name}`}
                            className="w-40"
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
                          <button className="rounded px-1 text-xs font-medium text-destructive transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40">
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
        </div>

        {invites.length > 0 && (
          <Card className="p-6">
            <h2 className="mb-3 text-subheading text-ink">Pending invitations</h2>
            <ul className="divide-y divide-mist/70">
              {invites.map((i) => (
                <li key={i.id} className="flex flex-col gap-2 py-3 text-sm first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-storm">{i.email}</span>
                    <RoleBadge role={i.role} />
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => copy(i.token)}
                      className="whitespace-nowrap rounded-md bg-cream px-2.5 py-1 font-mono text-xs text-storm/70 ring-1 ring-inset ring-mist transition-colors hover:bg-mist/40 hover:text-ink"
                    >
                      {copied === i.token ? "copied!" : "copy code"}
                    </button>
                    <form action={revokeInvite}>
                      <input type="hidden" name="inviteId" value={i.id} />
                      <button className="rounded px-1 text-xs font-medium text-destructive transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40">
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

      <Card className="h-fit p-6">
        <h2 className="text-subheading text-ink">Invite a member</h2>
        <p className="mt-1 text-caption text-storm/70">
          Generates an invite code. Share it with the person — they redeem it after signing up.
        </p>
        <form action={action} className="mt-5 space-y-4">
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
          <div className="mt-4 rounded-xl border border-success/35 bg-success/8 p-3 text-sm">
            <p className="font-medium text-success">Invite for {state.email}:</p>
            <button
              onClick={() => copy(state.token!)}
              className="mt-2 block w-full break-all rounded-md bg-cream px-2.5 py-1.5 text-left font-mono text-xs text-ink ring-1 ring-inset ring-success/30 transition-colors hover:bg-mist/30"
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
