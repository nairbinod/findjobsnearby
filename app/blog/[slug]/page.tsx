import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/blog";
import { breadcrumbSchema } from "@/lib/breadcrumb";
import ArticleLayout from "@/components/ArticleLayout";
import NewsletterSignup from "@/components/NewsletterSignup";

type BlogPostPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | FindJobsNearBy Blog`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, url: `/blog/${post.slug}`, publishedTime: post.publishedAt },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const canonicalUrl = `https://findjobsnearby.com/blog/${post.slug}`;
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: "FindJobsNearBy" },
    publisher: { "@type": "Organization", name: "FindJobsNearBy" },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };
  const breadcrumb = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <ArticleLayout
        eyebrow="FindJobsNearBy blog"
        title={post.title}
        description={post.description}
        publishedLabel={`Published ${new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        sections={post.sections}
        backHref="/blog"
        backLabel="All posts"
        afterArticle={<NewsletterSignup />}
      />
    </>
  );
}
