import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // produces a self-contained server bundle for a small Docker image
  output: "standalone",
  images: {
    // avatars are served from the backend; unoptimized avoids per-host config
    // and a sharp dependency when self-hosting.
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8080", pathname: "/uploads/**" },
      { protocol: "https", hostname: "**", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
