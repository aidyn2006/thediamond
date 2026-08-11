import { ImageResponse } from "next/og";
import { loadOgFont } from "./_og/font";
import { OG } from "./_og/theme";
import { SITE_NAME } from "@/lib/seo";

export const alt = "TheDiamond — маркетплейс телефонов в Казахстане";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";


export default async function OpengraphImage() {
  const font = await loadOgFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: OG.bg,
          color: OG.text,
          fontFamily: "OGSans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 26,
              height: 26,
              marginRight: 16,
              transform: "rotate(45deg)",
              borderRadius: 4,
              backgroundImage: OG.prism,
            }}
          />
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.01em" }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 960,
            }}
          >
            Телефоны от людей, а не от перекупов
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: OG.dim, maxWidth: 900 }}>
            Маркетплейс телефонов в Казахстане. Без комиссии.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 160, height: 6, borderRadius: 999, backgroundImage: OG.prism }} />
          <div style={{ marginLeft: 20, fontSize: 26, color: OG.dim }}>thediamond.kz</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "OGSans", data: font, weight: 600, style: "normal" }],
    },
  );
}
