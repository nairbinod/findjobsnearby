import type { Metadata } from "next";
import PostForm from "./PostForm";

export const metadata: Metadata = {
  title: "Post a Job for Free | FindJobsNearBy",
  description: "Post a job in the Dallas-Fort Worth area for free. Share the role and let AI draft a clear listing you review and approve before it goes live.",
  alternates: { canonical: "/post" },
};

const CONFIRM_ERROR_MESSAGES: Record<string, string> = {
  missing: "That confirmation link is missing its token.",
  invalid: "That confirmation link is invalid or has already been used.",
  account: "We couldn't set up your account. Try submitting your listing again.",
  job: "We couldn't publish your listing. Try submitting it again.",
};

type PostPageProps = { searchParams: Promise<{ confirmError?: string }> };

export default async function PostPage({ searchParams }: PostPageProps) {
  const { confirmError } = await searchParams;
  const initialError = confirmError ? (CONFIRM_ERROR_MESSAGES[confirmError] ?? "Something went wrong confirming your listing.") : "";
  return <PostForm initialError={initialError} />;
}
