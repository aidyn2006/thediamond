// One-off: generate PWA / apple-touch icons from public/logo.png (1254×1254).
// Run after the logo changes:  npm run gen:icons
// Uses sharp (present via Next's optional deps). If missing:  npm i -D sharp
// The generated PNGs are committed, so this never runs at build/runtime.
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "public", "logo.png");

const targets = [
  { out: path.join(root, "public", "icon-192.png"), size: 192 },
  { out: path.join(root, "public", "icon-512.png"), size: 512 },
  { out: path.join(root, "app", "apple-icon.png"), size: 180 },
];

for (const { out, size } of targets) {
  await sharp(SRC)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(out);
  console.log(`✓ ${path.relative(root, out)} (${size}×${size})`);
}
