import { ImageResponse } from "next/og";
import { loadOgFont } from "./_og/font";
import { SITE_NAME } from "@/lib/seo";

export const alt = "TheDiamond — контент, который работает";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRISM = "linear-gradient(135deg, #7fd4ff 0%, #c3b5ff 50%, #ffd9a0 100%)";

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
          background: "#101114",
          color: "#f2f3f5",
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
              backgroundImage: PRISM,
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
            Контент, который работает
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: "#9a9da7", maxWidth: 900 }}>
            Бренды Казахстана находят UGC-креаторов, а креаторы — заработок.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 160, height: 6, borderRadius: 999, backgroundImage: PRISM }} />
          <div style={{ marginLeft: 20, fontSize: 26, color: "#9a9da7" }}>thediamond.kz</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "OGSans", data: font, weight: 600, style: "normal" }],
    },
  );
}
