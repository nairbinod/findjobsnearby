import { NextResponse } from "next/server";
import { draftJobListing, type JobDraftInput } from "@/lib/draft-listing";

function isValidInput(body: unknown): body is JobDraftInput {
  if (!body || typeof body !== "object") return false;
  const input = body as Record<string, unknown>;
  return (
    typeof input.title === "string" && input.title.trim().length > 0 &&
    typeof input.companyName === "string" && input.companyName.trim().length > 0 &&
    typeof input.city === "string" && input.city.trim().length > 0 &&
    typeof input.state === "string" &&
    typeof input.employmentType === "string" &&
    typeof input.payRange === "string" && input.payRange.trim().length > 0 &&
    Array.isArray(input.responsibilities) && input.responsibilities.every((item) => typeof item === "string") &&
    input.responsibilities.length >= 3 && input.responsibilities.length <= 5
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValidInput(body)) {
    return NextResponse.json({ error: "Missing or invalid job details." }, { status: 400 });
  }

  try {
    const draft = await draftJobListing(body);
    return NextResponse.json(draft);
  } catch {
    return NextResponse.json({ error: "Could not draft the listing right now. Try again in a moment." }, { status: 502 });
  }
}
