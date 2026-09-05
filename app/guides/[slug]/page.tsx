import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { guides, getGuide } from "@/lib/guides";
import { breadcrumbSchema } from "@/lib/breadcrumb";
import ArticleLayout from "@/components/ArticleLayout";
import NewsletterSignup from "@/components/NewsletterSignup";

type GuidePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | FindJobsNearBy Guides`,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { type: "article", title: guide.title, description: guide.description, url: `/guides/${guide.slug}`, publishedTime: guide.publishedAt },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const canonicalUrl = `https://findjobsnearby.com/guides/${guide.slug}`;
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.publishedAt,
    author: { "@type": "Organization", name: "FindJobsNearBy" },
    publisher: { "@type": "Organization", name: "FindJobsNearBy" },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };
  const breadcrumb = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: guide.title, path: `/guides/${guide.slug}` }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <ArticleLayout
        eyebrow="FindJobsNearBy guides"
        title={guide.title}
        description={guide.description}
        publishedLabel={`Updated ${new Date(guide.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        sections={guide.sections}
        backHref="/guides"
        backLabel="All guides"
        afterArticle={<NewsletterSignup />}
      />
    </>
  );
}
