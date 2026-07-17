import { ImageResponse } from "next/og";
import { loadOgFont, fetchImageDataUri } from "../../_og/font";
import { getPublicCreator } from "@/lib/api";
import { absoluteImage, SITE_NAME } from "@/lib/seo";
import { categoryLabels, formatNumber } from "@/lib/categories";

export const alt = "Профиль креатора · TheDiamond";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRISM = "linear-gradient(135deg, #7fd4ff 0%, #c3b5ff 50%, #ffd9a0 100%)";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [font, p] = await Promise.all([loadOgFont(), getPublicCreator(id)]);

  const name = p?.name ?? SITE_NAME;
  const avatar = p?.avatarUrl ? await fetchImageDataUri(absoluteImage(p.avatarUrl)!) : null;
  const cats = (p?.categories ?? []).slice(0, 3).map((c) => categoryLabels[c]);

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
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 22,
              height: 22,
              marginRight: 14,
              transform: "rotate(45deg)",
              borderRadius: 4,
              backgroundImage: PRISM,
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>
            {SITE_NAME}
          </div>
        </div>

        {/* profile row */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {avatar ? (
            // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
            <img
              src={avatar}
              width={240}
              height={240}
              style={{
                width: 240,
                height: 240,
                borderRadius: 999,
                objectFit: "cover",
                border: "2px solid #2a2c34",
              }}
            />
          ) : (
            <div
              style={{
                width: 240,
                height: 240,
                borderRadius: 999,
                background: "#1e2026",
                border: "2px solid #2a2c34",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 110,
                fontWeight: 600,
                color: "#9a9da7",
              }}
            >
              {name.charAt(0)}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", marginLeft: 56, maxWidth: 720 }}>
            <div style={{ fontSize: 60, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {name}
            </div>
            {p && (
              <div style={{ marginTop: 14, fontSize: 30, color: "#9a9da7" }}>
                {`@${p.username}${p.city ? ` · ${p.city}` : ""}`}
              </div>
            )}
            {p && (
              <div style={{ display: "flex", alignItems: "baseline", marginTop: 22, fontSize: 32 }}>
                <span>Аудитория:</span>
                <span style={{ fontWeight: 600, marginLeft: 8 }}>
                  {formatNumber(p.totalFollowers)}
                </span>
              </div>
            )}
            {cats.length > 0 && (
              <div style={{ display: "flex", marginTop: 26 }}>
                {cats.map((c) => (
                  <div
                    key={c}
                    style={{
                      display: "flex",
                      marginRight: 12,
                      padding: "8px 18px",
                      borderRadius: 999,
                      border: "1px solid #2a2c34",
                      background: "#17181d",
                      fontSize: 24,
                      color: "#9a9da7",
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 140, height: 6, borderRadius: 999, backgroundImage: PRISM }} />
          <div style={{ marginLeft: 20, fontSize: 24, color: "#9a9da7" }}>thediamond.kz</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "OGSans", data: font, weight: 600, style: "normal" }],
    },
  );
}
