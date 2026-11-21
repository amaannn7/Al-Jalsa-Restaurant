// Builds transparent and light-on-dark versions of the official logo (no redrawing).
import sharp from 'sharp';
const src = 'docs/brand/logo-original.jpeg';
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const orig = Buffer.alloc(data.length), light = Buffer.alloc(data.length);
const IVORY = [244, 234, 216];
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  let a = 1 - Math.min(r, g, b) / 255;            // distance from white
  a = Math.min(1, Math.max(0, (a - 0.04) / 0.82)); // clean paper noise, firm up ink
  const un = (c) => a > 0.001 ? Math.max(0, Math.min(255, (c - 255 * (1 - a)) / a)) : 0;
  const R = un(r), G = un(g), B = un(b);
  orig.set([R, G, B, Math.round(a * 255)], i);
  // gold: high R and G, G well above B. maroon: R dominant, G low.
  const isGold = G > 90 && R - B > 70 && G - B > 40;
  const c = isGold ? [Math.min(255, R * 1.12), Math.min(255, G * 1.12), Math.min(255, B * 1.05)] : IVORY;
  light.set([...c.map(Math.round), Math.round(a * 255)], i);
}
const mk = (buf) => sharp(buf, { raw: { width: W, height: H, channels: 4 } });
const crops = {
  full: { left: 170, top: 30, width: 1200, height: 940 },
  mark: { left: 560, top: 30, width: 420, height: 520 },
  wordmark: { left: 180, top: 542, width: 1180, height: 150 },
};
for (const [name, region] of Object.entries(crops)) {
  for (const [buf, suffix] of [[orig, ''], [light, '-light']]) {
    const cut = await mk(buf).extract(region).png().toBuffer();
    await sharp(cut).trim({ threshold: 1 }).png().toFile(`public/brand/logo-${name}${suffix}.png`);
  }
}
// app icons: emblem on deep maroon square
const mark = await sharp(await sharp(await mk(light).extract(crops.mark).png().toBuffer()).trim({ threshold: 1 }).png().toBuffer()).resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const base = await sharp({ create: { width: 512, height: 512, channels: 4, background: '#3B1410' } })
  .composite([{ input: mark, gravity: 'center' }]).png().toBuffer();
const tile = (size) => sharp(base).resize(size, size).png();
await tile(512).toFile('src/app/icon.png');
await tile(180).toFile('src/app/apple-icon.png');
console.log('done', W, H);
