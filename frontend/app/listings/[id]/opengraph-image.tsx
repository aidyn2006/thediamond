import { ImageResponse } from "next/og";
import { loadOgFont, fetchImageDataUri } from "../../_og/font";
import { getPublicListing } from "@/lib/api";
import { absoluteImage, SITE_NAME } from "@/lib/seo";
import { brandLabels, conditionLabels, formatTenge, storageLabel } from "@/lib/phones";

export const alt = "Объявление · TheDiamond";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRISM = "linear-gradient(135deg, #7fd4ff 0%, #c3b5ff 50%, #ffd9a0 100%)";

/**
 * Share card for a listing: the phone's own photo on the left, price and specs on
 * the right. This is the card people actually send each other in WhatsApp, so the
 * price has to be readable at thumbnail size.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [font, listing] = await Promise.all([loadOgFont(), getPublicListing(id)]);

  if (!listing) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#101114",
            color: "#f2f3f5",
            fontFamily: "OGSans",
            fontSize: 52,
          }}
        >
          {SITE_NAME}
        </div>
      ),
      { ...size, fonts: [{ name: "OGSans", data: font, weight: 600, style: "normal" }] },
    );
  }

  const photo = listing.images.length
    ? await fetchImageDataUri(absoluteImage(listing.images[0])!)
    : null;

  const specs = [
    brandLabels[listing.brand],
    listing.storageGb ? storageLabel(listing.storageGb) : null,
    conditionLabels[listing.condition],
    listing.city,
  ].filter(Boolean) as string[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#101114",
          color: "#f2f3f5",
          fontFamily: "OGSans",
        }}
      >
        {/* photo panel */}
        <div
          style={{
            width: 480,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#17181d",
            borderRight: "1px solid #2a2c34",
          }}
        >
          {photo ? (
            // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
            <img
              src={photo}
              width={480}
              height={630}
              style={{ width: 480, height: 630, objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: 28, color: "#9a9da7" }}>без фото</div>
          )}
        </div>

        {/* text panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 56px",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 20,
                height: 20,
                marginRight: 12,
                transform: "rotate(45deg)",
                borderRadius: 4,
                backgroundImage: PRISM,
              }}
            />
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>
              {SITE_NAME}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.15, maxWidth: 560 }}>
              {listing.title}
            </div>
            <div
              style={{
                marginTop: 20,
                fontSize: 64,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {formatTenge(listing.price)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 28 }}>
              {specs.map((s) => (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    marginRight: 12,
                    marginBottom: 12,
                    padding: "8px 18px",
                    borderRadius: 999,
                    border: "1px solid #2a2c34",
                    background: "#17181d",
                    fontSize: 24,
                    color: "#9a9da7",
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 120, height: 6, borderRadius: 999, backgroundImage: PRISM }} />
            <div style={{ marginLeft: 18, fontSize: 22, color: "#9a9da7" }}>
              {`Продавец: ${listing.sellerName}`}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "OGSans", data: font, weight: 600, style: "normal" }],
    },
  );
}
