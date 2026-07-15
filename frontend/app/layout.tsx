import type { CSSProperties, Metadata } from "next";
import "./globals.css";

const siteUrl = "https://thediamond.kz";

const fontVars = {
  "--font-unbounded": "ui-sans-serif, system-ui, sans-serif",
  "--font-manrope": "ui-sans-serif, system-ui, sans-serif",
} satisfies CSSProperties;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TheDiamond — контент, который работает",
  description:
    "Платформа, где бренды Казахстана находят креаторов, а креаторы — заработок.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className="h-full"
      style={fontVars as CSSProperties}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
