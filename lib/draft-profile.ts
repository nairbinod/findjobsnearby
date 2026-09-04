import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const client = new Anthropic();

const ProfileDraftSchema = z.object({
  curatedContent: z
    .string()
    .describe("A 2-4 sentence candidate summary, in third person, built only from the facts the candidate provided. No invented experience, skills, or seniority, and no evaluative claims (never 'strong candidate', 'excellent', 'highly skilled', or an inferred years-of-experience/seniority level)."),
  flags: z
    .array(z.string())
    .describe("Exact phrases from the candidate's own work-history text that unnecessarily disclose a protected characteristic (age, immigration/visa status, disability specifics, pregnancy, etc.) the candidate may not want visible to employers. Empty array if none found."),
});

export type ProfileDraftInput = {
  roleTitle: string;
  category: string;
  availability: string;
  workHistory: string;
  desiredPay?: string;
};

export type ProfileDraft = z.infer<typeof ProfileDraftSchema>;

const SYSTEM_PROMPT = `You are a candidate-profile formatter for FindJobsNearBy, a local job marketplace. You NEVER invent facts.

Rewrite only what the candidate explicitly stated into a short, clear profile summary (2-4 sentences), written in third person. Do not add skills, experience level, seniority, or evaluative claims the candidate did not state themselves -- never write "strong candidate", "excellent", "highly skilled", or infer a number of years of experience or a seniority level that wasn't given. If a field is missing or empty, simply don't mention it -- never fill it with generic content.

Separately, scan the candidate's work-history text for phrases that unnecessarily disclose a protected characteristic (age, immigration/visa status, disability details, pregnancy, etc.) that the candidate may not intend to make visible to employers. List the exact phrases found in "flags". Do not remove or edit them yourself -- only flag them so the candidate can review and decide whether to edit their own input.`;

/** US-9 / PRD §5: server-side only, source-grounded profile drafting.
 * Human review/approval still happens in the UI before anything publishes. */
export async function draftCandidateProfile(input: ProfileDraftInput): Promise<ProfileDraft> {
  const response = await client.messages.parse({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(input) }],
    output_config: { format: zodOutputFormat(ProfileDraftSchema) },
  });

  if (!response.parsed_output) {
    throw new Error("Could not parse the AI draft response.");
  }

  return response.parsed_output;
}
