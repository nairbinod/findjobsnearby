import { getJobBySlug } from "@/lib/jobs-data";
import { renderShareCard } from "@/lib/share-card";

type RouteParams = { params: Promise<{ id: string }> };

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const job = await getJobBySlug(id);
  if (!job) return new Response("Not found", { status: 404 });

  const image = renderShareCard(job);
  const filename = `${slugify(job.title)}-${slugify(job.company)}.png`;

  return new Response(image.body, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
