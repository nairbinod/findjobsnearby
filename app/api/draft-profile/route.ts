import { NextResponse } from "next/server";
import { draftCandidateProfile, type ProfileDraftInput } from "@/lib/draft-profile";

function isValidInput(body: unknown): body is ProfileDraftInput {
  if (!body || typeof body !== "object") return false;
  const input = body as Record<string, unknown>;
  return (
    typeof input.roleTitle === "string" && input.roleTitle.trim().length > 0 &&
    typeof input.category === "string" && input.category.trim().length > 0 &&
    typeof input.availability === "string" && input.availability.trim().length > 0 &&
    typeof input.workHistory === "string" && input.workHistory.trim().length > 0
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValidInput(body)) {
    return NextResponse.json({ error: "Missing or invalid profile details." }, { status: 400 });
  }

  try {
    const draft = await draftCandidateProfile(body);
    return NextResponse.json(draft);
  } catch {
    return NextResponse.json({ error: "Could not draft the profile right now. Try again in a moment." }, { status: 502 });
  }
}
