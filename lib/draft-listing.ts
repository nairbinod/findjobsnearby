import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const client = new Anthropic();

const DraftSchema = z.object({
  description: z
    .string()
    .describe("A 2-4 sentence job description in clear plain English, built only from the facts provided. No invented responsibilities, requirements, benefits, or company details."),
  flags: z
    .array(z.string())
    .describe("Exact phrases from the employer's own input (title or responsibilities) that are age-coded, gendered, or otherwise legally risky/exclusionary. Empty array if none found."),
  requirementQuestions: z
    .array(z.string())
    .describe("Each item in the input requirements list rephrased as a short yes/no self-assessment question a candidate can check off (e.g. 'Reliable transportation' -> 'Do you have reliable transportation?'). Same order, same count as the input -- never add, drop, or merge items. Empty array if no requirements were provided."),
});

export type JobDraftInput = {
  title: string;
  companyName: string;
  city: string;
  state: string;
  employmentType: string;
  payRange: string;
  responsibilities: string[];
  requirements?: string[];
};

export type JobDraft = z.infer<typeof DraftSchema>;

const SYSTEM_PROMPT = `You are a job-listing formatter for FindJobsNearBy, a local job marketplace. You NEVER invent facts.

Rewrite only the details the employer explicitly provided into a short, clear job description (2-4 sentences). Do not add responsibilities, requirements, benefits, seniority level, or culture claims that were not stated. Do not use evaluative or promotional language ("exciting", "fast-paced", "great opportunity") unless the employer's own words used it. If a field is missing or empty, simply don't mention it -- never fill it with generic content.

Separately, scan the employer's title and responsibilities for legally risky or exclusionary phrasing: age-coded language (e.g. "young", "recent grad", "energetic" implying youth), gendered language (e.g. "he must", "waitress" where a neutral term exists), or other exclusionary phrasing. List the exact phrases found in "flags". Do not remove, soften, or fix them yourself -- only flag them so the employer can review and edit their own listing.

If the employer provided a requirements list, rephrase each one as a short yes/no question a candidate can self-assess against (e.g. "2+ years experience" -> "Do you have 2+ years of experience?"). Keep the same order and the same number of items -- you are rephrasing, not adding, dropping, merging, or inventing requirements. If no requirements were provided, return an empty list.`;

/** US-3 / PRD §5: server-side only, source-grounded drafting with human
 * review still required before publish (enforced in the /post UI). */
export async function draftJobListing(input: JobDraftInput): Promise<JobDraft> {
  const response = await client.messages.parse({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(input) }],
    output_config: { format: zodOutputFormat(DraftSchema) },
  });

  if (!response.parsed_output) {
    throw new Error("Could not parse the AI draft response.");
  }

  return response.parsed_output;
}
