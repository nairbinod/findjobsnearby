import { ImageResponse } from "next/og";
import type { Job } from "@/lib/jobs";

const INK = "#152d2a";
const CORAL = "#ef725d";
const CREAM = "#f8f6f1";
const MINT = "#d9e9dc";
const YELLOW = "#f2cf75";
const LINE = "#dce2dc";

// ImageResponse (satori) can't auto-size a canvas to its content like a
// browser can -- width/height must be fixed up front. So the height is
// estimated from the actual content (mainly: how many responsibility
// bullets there are) rather than using a fixed square with a flex spacer,
// which left a large empty gap for shorter listings.
const WIDTH = 1080;
const PADDING = 64;
const HEADER_H = 46;
const HEADER_GAP = 56;
const COMPANY_BLOCK_H = 40;
const TITLE_BLOCK_H = 150; // covers 1-2 line titles at this font size
const TAGS_GAP = 40;
const TAGS_H = 58;
const RESP_GAP = 48;
const RESP_ROW_H = 52; // per bullet, includes its own bottom gap
const FOOTER_GAP = 32;
const FOOTER_H = 56;
const MAX_RESPONSIBILITIES = 5;

export function shareCardHeight(responsibilityCount: number) {
  const count = Math.min(responsibilityCount, MAX_RESPONSIBILITIES);
  return (
    PADDING * 2 +
    HEADER_H + HEADER_GAP +
    COMPANY_BLOCK_H + TITLE_BLOCK_H +
    TAGS_GAP + TAGS_H +
    RESP_GAP + count * RESP_ROW_H +
    FOOTER_GAP + FOOTER_H
  );
}

export function renderShareCard(job: Job) {
  const responsibilities = job.responsibilities.slice(0, MAX_RESPONSIBILITIES);
  const height = shareCardHeight(responsibilities.length);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: CREAM, padding: PADDING }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 30, fontWeight: 700, color: INK }}>
            findjobs<span style={{ color: CORAL }}>nearby</span>
          </div>
          <div style={{ display: "flex", background: MINT, color: INK, fontSize: 20, fontWeight: 700, padding: "10px 20px", borderRadius: 999, letterSpacing: 1 }}>HIRING NOW</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: HEADER_GAP }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: 2 }}>{job.company}</div>
          <div style={{ display: "flex", fontSize: 62, fontWeight: 700, color: INK, marginTop: 14, lineHeight: 1.08, maxWidth: 880 }}>{job.title}</div>
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: TAGS_GAP }}>
          <div style={{ display: "flex", background: "#ffffff", border: `2px solid ${INK}`, borderRadius: 16, padding: "14px 22px", fontSize: 26, fontWeight: 700, color: INK }}>{job.pay}</div>
          <div style={{ display: "flex", background: "#ffffff", borderRadius: 16, padding: "14px 22px", fontSize: 26, fontWeight: 600, color: INK, border: `2px solid ${LINE}` }}>{job.type}</div>
          <div style={{ display: "flex", background: "#ffffff", borderRadius: 16, padding: "14px 22px", fontSize: 26, fontWeight: 600, color: INK, border: `2px solid ${LINE}` }}>{job.city}, {job.state}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: RESP_GAP, gap: 16 }}>
          {responsibilities.map((r) => (
            <div key={r} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ display: "flex", width: 10, height: 10, marginTop: 12, borderRadius: 999, background: CORAL }} />
              <div style={{ display: "flex", fontSize: 28, color: INK, opacity: 0.85, maxWidth: 820 }}>{r}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `2px solid ${LINE}`, marginTop: FOOTER_GAP, paddingTop: FOOTER_GAP }}>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: INK }}>Apply free at findjobsnearby.com</div>
          <div style={{ display: "flex", background: YELLOW, color: INK, fontSize: 24, fontWeight: 700, padding: "16px 32px", borderRadius: 999 }}>Apply now →</div>
        </div>
      </div>
    ),
    { width: WIDTH, height },
  );
}
