import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const INK = "#152d2a";
const CORAL = "#ef725d";
const CREAM = "#f8f6f1";
const MINT = "#d9e9dc";

export function renderOgImage(eyebrow: string, title: string) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "80px", background: CREAM }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4, color: CORAL }}>{eyebrow}</div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: INK, marginTop: 28, lineHeight: 1.08, maxWidth: 980 }}>{title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: MINT, border: `3px solid ${INK}` }} />
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: INK }}>
            findjobs<span style={{ color: CORAL }}>nearby</span>
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
