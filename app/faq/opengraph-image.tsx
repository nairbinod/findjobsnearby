import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";

export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage("Questions", "Frequently asked.");
}
