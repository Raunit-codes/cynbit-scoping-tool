
import { NextRequest, NextResponse } from "next/server";
import { saveLead, validateLeadInput } from "@/lib/store";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        errors: [{ field: "body", message: "Invalid JSON." }],
      },
      { status: 400 }
    );
  }

  const result = validateLeadInput(body);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 422 }
    );
  }

  try {
    const lead = await saveLead(result.data);
    return NextResponse.json(
      { ok: true, lead },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save lead:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Unable to save your inquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}
