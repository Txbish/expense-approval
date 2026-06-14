import { ImageResponse } from "next/og";

// Branded social card, generated at request time. Echoes the dark sign-in panel:
// ink canvas, the stacked chevron mark, an orange tile accent, one blue dot.
export const alt = "approvals — multi-tenant expense approvals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#001011";
const CREAM = "#fcfbf8";
const BLUE = "#007aff";
const ORANGE = "#fd5321";

export default function OpengraphImage() {
  // The BrandMark, inlined as a data URI so Satori can rasterize it.
  const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="${CREAM}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 11.5 16 8.5l5 3"/><path d="M9 16.5 16 12.5l7 4"/><path d="M7.5 21.5 16 16.8l8.5 4.7"/></svg>`;
  const mark = `data:image/svg+xml,${encodeURIComponent(markSvg)}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: INK,
          padding: "72px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* decorative orange tile, bleeding off the top-right corner */}
        <div
          style={{
            position: "absolute",
            top: -96,
            right: -96,
            width: 320,
            height: 320,
            borderRadius: 72,
            backgroundColor: ORANGE,
          }}
        />

        {/* brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={mark} width={56} height={56} alt="" />
          <div style={{ fontSize: 34, fontWeight: 600, color: CREAM, letterSpacing: "-0.02em" }}>
            approvals.
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 900 }}>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 700,
              color: CREAM,
              letterSpacing: "-0.035em",
              lineHeight: 1.04,
            }}
          >
            <span>Request, review, decide</span>
            <span style={{ color: BLUE }}>.</span>
          </div>
          <div style={{ display: "flex", fontSize: 29, color: "rgba(252,251,248,0.72)", lineHeight: 1.4, maxWidth: 840 }}>
            Multi-tenant expense approvals with authorization enforced in the database — secure by default, responsive on any device.
          </div>
        </div>

        {/* footer: tech stack + call-to-action pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: "rgba(252,251,248,0.5)", letterSpacing: "0.04em" }}>
            Next.js · Supabase (Postgres + RLS) · Vercel
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 26,
              fontWeight: 600,
              color: CREAM,
              backgroundColor: BLUE,
              padding: "16px 30px",
              borderRadius: 999,
              letterSpacing: "-0.01em",
            }}
          >
            Try the live demo →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
