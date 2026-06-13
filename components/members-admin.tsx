"use client";

import { useActionState, useState } from "react";
import { Button, Card, Field, FormError, Input, Select } from "@/components/ui";
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
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.membershipId}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {m.name} {m.isSelf && <span className="text-xs text-slate-400">(you)</span>}
                    </div>
                    <div className="text-xs text-slate-500">{m.email}</div>
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
                          <option value="requester">requester</option>
                          <option value="approver">approver</option>
                          <option value="admin">admin</option>
                        </Select>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!m.isSelf && (
                      <form action={removeMember}>
                        <input type="hidden" name="membershipId" value={m.membershipId} />
                        <input type="hidden" name="userId" value={m.userId} />
                        <button className="text-xs text-rose-600 hover:text-rose-700">Remove</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {invites.length > 0 && (
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Pending invitations</h2>
            <ul className="space-y-2">
              {invites.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="text-slate-700">{i.email}</span>{" "}
                    <RoleBadge role={i.role} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copy(i.token)}
                      className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600 hover:bg-slate-200"
                    >
                      {copied === i.token ? "copied!" : "copy code"}
                    </button>
                    <form action={revokeInvite}>
                      <input type="hidden" name="inviteId" value={i.id} />
                      <button className="text-xs text-rose-600 hover:text-rose-700">revoke</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Card className="h-fit p-5">
        <h2 className="text-sm font-semibold text-slate-900">Invite a member</h2>
        <p className="mt-1 text-xs text-slate-500">
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
            {pending ? "Creating…" : "Create invite"}
          </Button>
        </form>
        {state?.token && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">
            <p className="text-emerald-800">Invite for {state.email}:</p>
            <button
              onClick={() => copy(state.token!)}
              className="mt-1 block w-full break-all rounded bg-white px-2 py-1 text-left font-mono text-xs text-slate-700 ring-1 ring-emerald-200 hover:bg-slate-50"
            >
              {copied === state.token ? "copied to clipboard!" : state.token}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
