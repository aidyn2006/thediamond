import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Fira Sans SemiBold (static TTF, Latin + Cyrillic + digits) for OG image text.
// next/og's built-in font has no Cyrillic, and Satori chokes on variable fonts,
// so we bundle this static cut and load it per render. Read from public/ (copied
// verbatim into the standalone build) via an absolute cwd path — the
// `fetch(new URL(...))` asset pattern isn't supported by Turbopack.
export async function loadOgFont(): Promise<Buffer> {
  return readFile(join(process.cwd(), "public", "fonts", "og-font.ttf"));
}

/** Fetch a remote image (e.g. a backend avatar) as a data URI, or null on failure. */
export async function fetchImageDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
