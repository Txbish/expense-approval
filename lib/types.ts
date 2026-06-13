// Domain types. Hand-written (the local CLI's `gen types` requires platform
// auth in this version). These mirror the columns defined in supabase/migrations.

export type Role = "admin" | "approver" | "requester";
export type RequestStatus = "pending" | "approved" | "rejected" | "withdrawn";
export type EventType = "created" | "approved" | "rejected" | "withdrawn";
export type NotificationType = "submitted" | "approved" | "rejected";

export interface Organization {
  id: string;
  name: string;
  default_currency: string;
  approval_threshold_minor: number;
  created_by: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: Role;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
}

export interface ExpenseRequest {
  id: string;
  org_id: string;
  requester_id: string;
  title: string;
  description: string | null;
  category: string;
  amount_minor: number;
  currency: string;
  status: RequestStatus;
  decided_by: string | null;
  decision_note: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestEvent {
  id: string;
  org_id: string;
  request_id: string;
  actor_id: string | null;
  type: EventType;
  from_status: RequestStatus | null;
  to_status: RequestStatus | null;
  note: string | null;
  created_at: string;
}

export interface Invitation {
  id: string;
  org_id: string;
  email: string;
  role: Role;
  token: string;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  org_id: string | null;
  request_id: string | null;
  type: NotificationType;
  body: string;
  read_at: string | null;
  created_at: string;
}
