// Converts the restaurant's menu photos (and their Vision cut-outs) to WebP for the site,
// and reports which cut-outs are whole plates (not cropped by the original photo frame).
// Usage: node scripts/assets/menu-images.mjs <photos-dir> <cutouts-dir>
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const [photos, cuts] = process.argv.slice(2);
const report = {};
for (const f of fs.readdirSync(photos)) {
  if (f.startsWith('_')) continue;
  const slug = f.replace(/\.(png|jpe?g)$/i, '');
  const meta = await sharp(path.join(photos, f)).metadata();
  if (meta.width < 400) { report[slug] = { photo: false }; continue; } // placeholder icon
  await sharp(path.join(photos, f)).flatten({ background: '#ffffff' }).webp({ quality: 82 }).toFile(`public/images/menu/${slug}.webp`);
  const cutPath = path.join(cuts, slug + '.png');
  if (!fs.existsSync(cutPath)) { report[slug] = { photo: true, cutout: false }; continue; }
  const { data, info } = await sharp(cutPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  let edge = 0, total = 0;
  const a = (x, y) => data[(y * W + x) * 4 + 3];
  for (let x = 0; x < W; x++) { total += 2; if (a(x, 0) > 128) edge++; if (a(x, H - 1) > 128) edge++; }
  for (let y = 0; y < H; y++) { total += 2; if (a(0, y) > 128) edge++; if (a(W - 1, y) > 128) edge++; }
  const edgeRatio = edge / total;
  const trimmed = await sharp(cutPath).trim({ threshold: 2 }).png().toBuffer();
  const tm = await sharp(trimmed).metadata();
  const side = Math.max(tm.width, tm.height);
  await sharp(trimmed)
    .resize({ width: side, height: side, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 90 })
    .toFile(`public/images/menu/cut/${slug}.webp`);
  report[slug] = { photo: true, cutout: true, whole: edgeRatio < 0.02, edgeRatio: +edgeRatio.toFixed(3) };
}
fs.writeFileSync('scripts/assets/menu-images-report.json', JSON.stringify(report, null, 1));
console.log(Object.entries(report).map(([k, v]) => `${k}: ${v.whole ? 'WHOLE' : v.cutout ? 'cropped ' + v.edgeRatio : v.photo ? 'photo-only' : 'NO PHOTO'}`).join('\n'));
