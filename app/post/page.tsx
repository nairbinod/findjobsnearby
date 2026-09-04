import type { Metadata } from "next";
import PostForm from "./PostForm";

export const metadata: Metadata = {
  title: "Post a Job for Free | FindJobsNearBy",
  description: "Post a job in the Dallas-Fort Worth area for free. Share the role and let AI draft a clear listing you review and approve before it goes live.",
  alternates: { canonical: "/post" },
};

export default function PostPage() {
  return <PostForm />;
}
