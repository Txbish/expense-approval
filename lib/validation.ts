import { z } from "zod";

/**
 * Boundary validation. Every server action parses its input through one of
 * these before touching the database. Fail fast, clear messages, never trust
 * the client.
 */

export const CATEGORIES = [
  "Travel",
  "Equipment",
  "Software",
  "Training",
  "Meals & Entertainment",
  "Office Supplies",
  "Other",
] as const;

export const newRequestSchema = z.object({
  title: z.string().trim().min(3, "Give it a short title").max(120),
  category: z.enum(CATEGORIES),
  amountMinor: z
    .number({ message: "Enter a valid amount" })
    .int()
    .positive("Amount must be greater than zero")
    .max(1_000_000_000, "That amount looks too large"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const decisionSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const createOrgSchema = z.object({
  name: z.string().trim().min(2, "Organization name is too short").max(80),
  currency: z.string().trim().length(3, "Use a 3-letter currency code").toUpperCase(),
  thresholdMinor: z
    .number()
    .int()
    .min(0, "Threshold can't be negative")
    .max(1_000_000_000),
});

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  role: z.enum(["admin", "approver", "requester"]),
});

export const orgSettingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  currency: z.string().trim().length(3).toUpperCase(),
  thresholdMinor: z.number().int().min(0).max(1_000_000_000),
});
