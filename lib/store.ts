import { findPillar, findStage, findTimeline } from "./domain";
import { computeEstimate } from "./estimate";
import { prisma } from "./prisma";
import { LeadInput, StoredLead } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateLeadInput(
  body: unknown
): { ok: true; data: LeadInput } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      errors: [{ field: "body", message: "Invalid request body." }],
    };
  }

  const b = body as Partial<LeadInput>;

  const pillar = typeof b.pillar === "string" ? findPillar(b.pillar) : undefined;
  const stage = typeof b.stage === "string" ? findStage(b.stage) : undefined;
  const timeline =
    typeof b.timeline === "string" ? findTimeline(b.timeline) : undefined;

  if (!pillar) {
    errors.push({ field: "pillar", message: "Choose a valid service." });
  }

  if (!stage) {
    errors.push({ field: "stage", message: "Choose a valid company stage." });
  }

  if (!timeline) {
    errors.push({ field: "timeline", message: "Choose a valid timeline." });
  }

  if (!Array.isArray(b.scope) || b.scope.length === 0) {
    errors.push({ field: "scope", message: "Select at least one scope item." });
  } else if (
    !b.scope.every(
      (id) =>
        typeof id === "string" &&
        pillar?.scope.some((item) => item.id === id)
    )
  ) {
    errors.push({
      field: "scope",
      message: "One or more selected scope items are invalid.",
    });
  }

  if (
    typeof b.name !== "string" ||
    b.name.trim().length < 2 ||
    b.name.trim().length > 100
  ) {
    errors.push({ field: "name", message: "Enter a valid name." });
  }

  if (
    typeof b.email !== "string" ||
    b.email.trim().length > 254 ||
    !EMAIL_RE.test(b.email.trim())
  ) {
    errors.push({ field: "email", message: "Enter a valid email address." });
  }

  if (typeof b.company === "string" && b.company.length > 150) {
    errors.push({ field: "company", message: "Company name is too long." });
  }

  if (typeof b.industry === "string" && b.industry.length > 100) {
    errors.push({ field: "industry", message: "Industry is too long." });
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      pillar: b.pillar!,
      scope: [...new Set(b.scope!)],
      stage: b.stage!,
      timeline: b.timeline!,
      name: b.name!.trim(),
      email: b.email!.trim(),
      company:
        typeof b.company === "string" ? b.company.trim() : undefined,
      industry:
        typeof b.industry === "string" ? b.industry.trim() : undefined,
    },
  };
}

// Persist leads in Supabase PostgreSQL using Prisma.
export async function saveLead(input: LeadInput): Promise<StoredLead> {
  const estimate = computeEstimate(
    input.pillar,
    input.scope,
    input.stage,
    input.timeline
  );

  if (!estimate) {
    throw new Error("Could not compute estimate for the given input.");
  }

  const savedLead = await prisma.lead.create({
    data: {
      name: input.name,
      email: input.email,
      company: input.company ?? null,
      industry: input.industry ?? null,
      pillar: input.pillar,
      scope: input.scope,
      stage: input.stage,
      timeline: input.timeline,
      estimateLowThousandsINR: estimate.lowThousandsINR,
      estimateHighThousandsINR: estimate.highThousandsINR,
    },
  });

  return {
    ...input,
    id: savedLead.id,
    estimate,
    submittedAt: savedLead.submittedAt.toISOString(),
  };
}