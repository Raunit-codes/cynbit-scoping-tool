import { Pillar, Stage, Timeline } from "./types";

/**
 * These mirror Cynbit's actual four service pillars and their published
 * sub-services (see /services on cynbit.in), so the wizard stays accurate
 * if someone cross-checks it against the live site.
 */
export const PILLARS: Pillar[] = [
  {
    id: "ai",
    title: "AI automation & agents",
    description: "Autonomous agents, LLM workflows, voice AI.",
    base: 150,
    scope: [
      { id: "agent", title: "Autonomous agent", description: "Manages leads, coordination, or a workflow end to end." },
      { id: "docauto", title: "LLM document automation", description: "Replace manual data entry / document handling." },
      { id: "voice", title: "AI voice agent", description: "Voice-driven customer or ops interaction." },
      { id: "saasint", title: "Existing SaaS integration", description: "Embed intelligence into your current stack." },
    ],
  },
  {
    id: "software",
    title: "Software & web development",
    description: "Full-stack web, mobile, and backend builds.",
    base: 120,
    scope: [
      { id: "webapp", title: "Web application", description: "Customer- or employee-facing platform." },
      { id: "mobile", title: "Mobile app", description: "iOS / Android companion or standalone app." },
      { id: "backend", title: "Backend & APIs", description: "Services, data layer, integrations." },
      { id: "payments", title: "Payments / commerce", description: "Checkout, billing, or marketplace logic." },
    ],
  },
  {
    id: "cloud",
    title: "Cloud infrastructure",
    description: "AWS/Azure architecture, migration, DevOps.",
    base: 90,
    scope: [
      { id: "setup", title: "Cloud setup", description: "AWS or Azure architecture from scratch." },
      { id: "migration", title: "Legacy migration", description: "Move an existing system to modern infra." },
      { id: "cicd", title: "DevOps / CI-CD", description: "Automated build, test, and deploy pipeline." },
      { id: "security", title: "Security audit", description: "Zero-trust review and hardening." },
    ],
  },
  {
    id: "seo",
    title: "Digital marketing & SEO",
    description: "Technical SEO, paid growth, funnels.",
    base: 60,
    scope: [
      { id: "seoaudit", title: "Technical SEO audit", description: "Infrastructure-level search optimization." },
      { id: "ads", title: "Performance ads", description: "Google / Meta campaigns tied to ROI." },
      { id: "crm", title: "CRM automation", description: "Nurture sequences that run themselves." },
      { id: "funnel", title: "Funnel / landing pages", description: "Conversion-focused page builds." },
    ],
  },
];

export const STAGES: Stage[] = [
  { id: "startup", title: "Early-stage / startup", description: "Pre-seed to seed, moving fast.", multiplier: 1.0 },
  { id: "smb", title: "Growing SMB", description: "Established, scaling team or revenue.", multiplier: 1.3 },
  { id: "enterprise", title: "Enterprise", description: "Larger org, more stakeholders & compliance.", multiplier: 1.8 },
];

export const TIMELINES: Timeline[] = [
  { id: "asap", title: "As soon as possible", description: "Rush delivery.", multiplier: 1.25 },
  { id: "1-3", title: "1–3 months", description: "Standard runway.", multiplier: 1.0 },
  { id: "3-6", title: "3–6 months", description: "Comfortable pace.", multiplier: 0.9 },
  { id: "flex", title: "Exploring / flexible", description: "No fixed date yet.", multiplier: 0.85 },
];

export function findPillar(id: string) {
  return PILLARS.find((p) => p.id === id);
}
export function findStage(id: string) {
  return STAGES.find((s) => s.id === id);
}
export function findTimeline(id: string) {
  return TIMELINES.find((t) => t.id === id);
}
