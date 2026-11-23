// Builds the site's 4K photos from the original Unsplash downloads (and Upscayl outputs for any
// original under 3840px). Usage: node scripts/assets/stock-images.mjs <originals-dir> <upscaled-dir>
//   dish photos: public/images/menu/<slug>.webp   (3840px long edge, quality 88)
//   site photos: public/images/site/<name>.webp   (files named _site-<name>.jpg)
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const [origDir, upDir] = process.argv.slice(2);
const MAX = 3840;
fs.rmSync("public/images/menu", { recursive: true, force: true });
fs.mkdirSync("public/images/menu", { recursive: true });
fs.mkdirSync("public/images/site", { recursive: true });
const report = {};
for (const f of fs.readdirSync(origDir).filter((x) => x.endsWith(".jpg")).sort()) {
  const slug = f.replace(/\.jpg$/, "");
  const up = path.join(upDir, `${slug}.png`);
  const src = fs.existsSync(up) ? up : path.join(origDir, f);
  const site = slug.startsWith("_site-");
  const out = site ? `public/images/site/${slug.slice(6)}.webp` : `public/images/menu/${slug}.webp`;
  const info = await sharp(src).rotate().resize(MAX, MAX, { fit: "inside", withoutEnlargement: true }).webp({ quality: 88, effort: 5 }).toFile(out);
  report[slug] = { width: info.width, height: info.height, upscaled: src === up ? "upscayl-standard-4x" : null, kb: Math.round(info.size / 1024) };
  console.log(slug, info.width, "x", info.height, report[slug].upscaled ? "(upscaled)" : "", report[slug].kb + "KB");
}
fs.writeFileSync("scripts/assets/stock-images-report.json", JSON.stringify(report, null, 1));
