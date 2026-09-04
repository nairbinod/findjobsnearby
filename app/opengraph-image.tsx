import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";

export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage("Local work. Human connection.", "Good work is closer than you think.");
}
