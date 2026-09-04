import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";

export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage("For local business owners", "Hire locally. Pay only when it works.");
}
