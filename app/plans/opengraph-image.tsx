import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";

export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage("Simple pricing", "Start free. Grow when you hire more.");
}
