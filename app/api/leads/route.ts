import { NextRequest, NextResponse } from "next/server";
import { listLeads, saveLead, validateLeadInput } from "@/lib/store";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: [{ field: "body", message: "Invalid JSON." }] }, { status: 400 });
  }

  const result = validateLeadInput(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  const lead = saveLead(result.data);

  // Production note: notify the Cynbit team here (e.g. Resend/SMTP email,
  // or a Slack webhook) instead of — or in addition to — reading /api/leads.
  // Left out of this prototype since it needs real credentials to wire up.

  return NextResponse.json({ ok: true, lead }, { status: 201 });
}

/** Lets the team (or this prototype's own internal dashboard) pull qualified leads. */
export async function GET() {
  return NextResponse.json({ ok: true, leads: listLeads() });
}
