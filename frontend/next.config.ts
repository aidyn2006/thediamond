import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // produces a self-contained server bundle for a small Docker image
  output: "standalone",
  images: {
    // AVIF first, WebP as the fallback — a listing photo shot on a phone typically
    // lands 40–60% smaller than the original JPEG, which is the single biggest LCP
    // win on a page that is mostly a grid of photos.
    formats: ["image/avif", "image/webp"],
    // Uploads are immutable (a new photo gets a new filename), so the optimizer's
    // cache can hold them for a long time instead of re-encoding on every deploy.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Widths the catalog grid and the gallery actually request. Trimming the default
    // list keeps the optimizer from generating sizes nothing ever asks for.
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // Avatars and uploads come from the backend, whose host differs per deployment.
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8080", pathname: "/uploads/**" },
      { protocol: "https", hostname: "**", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
