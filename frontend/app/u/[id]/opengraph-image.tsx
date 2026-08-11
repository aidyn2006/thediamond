import { ImageResponse } from "next/og";
import { loadOgFont, fetchImageDataUri } from "../../_og/font";
import { OG } from "../../_og/theme";
import { ogPrice } from "../../_og/format";
import { getPublicSeller } from "@/lib/api";
import { absoluteImage, SITE_NAME } from "@/lib/seo";

export const alt = "Профиль продавца · TheDiamond";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";


/** "5 объявлений" / "1 объявление" — RU plural for the seller's active count. */
function listingsLabel(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod10 === 1 && mod100 !== 11) return `${n} объявление`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} объявления`;
  return `${n} объявлений`;
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [font, seller] = await Promise.all([loadOgFont(), getPublicSeller(id)]);

  const name = seller?.displayName ?? SITE_NAME;
  const avatar = seller?.avatarUrl
    ? await fetchImageDataUri(absoluteImage(seller.avatarUrl)!)
    : null;
  // Cheapest active listing — the one number that makes the card worth clicking.
  const from = seller?.listings.length
    ? Math.min(...seller.listings.map((l) => l.price))
    : null;

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
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 22,
              height: 22,
              marginRight: 14,
              transform: "rotate(45deg)",
              borderRadius: 4,
              backgroundImage: OG.prism,
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>
            {SITE_NAME}
          </div>
        </div>

        {/* seller row */}
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
                border: `2px solid ${OG.border}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 240,
                height: 240,
                borderRadius: 999,
                background: OG.surface2,
                border: `2px solid ${OG.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 110,
                fontWeight: 600,
                color: OG.dim,
              }}
            >
              {name.charAt(0)}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", marginLeft: 56, maxWidth: 720 }}>
            <div style={{ fontSize: 60, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {name}
            </div>
            {seller && (
              <div style={{ marginTop: 14, fontSize: 30, color: OG.dim }}>
                {[seller.city, "продаёт телефоны"].filter(Boolean).join(" · ")}
              </div>
            )}
            {seller && (
              <div style={{ display: "flex", alignItems: "baseline", marginTop: 22, fontSize: 32 }}>
                <span>{listingsLabel(seller.listings.length)}</span>
                {from != null && (
                  <span style={{ fontWeight: 600, marginLeft: 12 }}>
                    {`от ${ogPrice(from)}`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 140, height: 6, borderRadius: 999, backgroundImage: OG.prism }} />
          <div style={{ marginLeft: 20, fontSize: 24, color: OG.dim }}>thediamond.kz</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "OGSans", data: font, weight: 600, style: "normal" }],
    },
  );
}
