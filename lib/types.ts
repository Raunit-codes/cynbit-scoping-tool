export type PillarId = "ai" | "software" | "cloud" | "seo";
export type StageId = "startup" | "smb" | "enterprise";
export type TimelineId = "asap" | "1-3" | "3-6" | "flex";

export interface ScopeItem {
  id: string;
  title: string;
  description: string;
}

export interface Pillar {
  id: PillarId;
  title: string;
  description: string;
  /** Base cost in thousands of INR before multipliers. */
  base: number;
  scope: ScopeItem[];
}

export interface Stage {
  id: StageId;
  title: string;
  description: string;
  multiplier: number;
}

export interface Timeline {
  id: TimelineId;
  title: string;
  description: string;
  multiplier: number;
}

/** Raw shape submitted by the wizard form. */
export interface LeadInput {
  pillar: PillarId;
  scope: string[];
  stage: StageId;
  timeline: TimelineId;
  name: string;
  email: string;
  company?: string;
  industry?: string;
}

export interface EstimateRange {
  lowThousandsINR: number;
  highThousandsINR: number;
}

/** A lead as persisted server-side, with the server-computed estimate. */
export interface StoredLead extends LeadInput {
  id: string;
  estimate: EstimateRange;
  submittedAt: string;
}
