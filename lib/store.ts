import { randomUUID } from "crypto";
import { findPillar, findStage, findTimeline } from "./domain";
import { computeEstimate } from "./estimate";
import { LeadInput, StoredLead } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationError {
  field: string;
  message: string;
}

/** Server-side validation. The client validates too, but the server never trusts it. */
export function validateLeadInput(body: unknown): { ok: true; data: LeadInput } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const b = (body ?? {}) as Partial<LeadInput>;

  if (!b.pillar || !findPillar(b.pillar)) errors.push({ field: "pillar", message: "Choose a valid service." });
  if (!b.stage || !findStage(b.stage)) errors.push({ field: "stage", message: "Choose a valid company stage." });
  if (!b.timeline || !findTimeline(b.timeline)) errors.push({ field: "timeline", message: "Choose a valid timeline." });
  if (!Array.isArray(b.scope) || b.scope.length === 0) errors.push({ field: "scope", message: "Select at least one scope item." });
  if (!b.name || typeof b.name !== "string" || b.name.trim().length < 2) errors.push({ field: "name", message: "Enter your name." });
  if (!b.email || typeof b.email !== "string" || !EMAIL_RE.test(b.email)) errors.push({ field: "email", message: "Enter a valid email address." });

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      pillar: b.pillar!,
      scope: b.scope!,
      stage: b.stage!,
      timeline: b.timeline!,
      name: b.name!.trim(),
      email: b.email!.trim(),
      company: typeof b.company === "string" ? b.company.trim() : undefined,
      industry: typeof b.industry === "string" ? b.industry.trim() : undefined,
    },
  };
}

/**
 * In-memory store — good enough for this prototype and for local dev.
 *
 * It resets on every server restart / serverless cold start, so it is NOT
 * suitable for the production deployment. Swap this module for a real
 * table (e.g. Postgres via Prisma/Supabase, which are already in Cynbit's
 * own stated stack) behind the same two functions: saveLead / listLeads.
 */
const leads: StoredLead[] = [];

export function saveLead(input: LeadInput): StoredLead {
  const estimate = computeEstimate(input.pillar, input.scope, input.stage, input.timeline);
  if (!estimate) throw new Error("Could not compute estimate for the given input.");

  const lead: StoredLead = {
    ...input,
    id: randomUUID(),
    estimate,
    submittedAt: new Date().toISOString(),
  };
  leads.push(lead);
  return lead;
}

export function listLeads(): StoredLead[] {
  return leads;
}
