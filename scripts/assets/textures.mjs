// Renders the stone ground tile and dust splashes in headless Chrome (procedural, no stock assets).
import { chromium } from '/Users/amaanyusuf/qa-tools/node_modules/playwright/index.mjs';
import sharp from 'sharp';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 900, height: 900 } });
// 1. Stone: tileable turbulence, very low contrast, warm charcoal.
await p.setContent(`<body style="margin:0;background:#110E0C">
<svg width="900" height="900" xmlns="http://www.w3.org/2000/svg">
<filter id="n" filterUnits="userSpaceOnUse" x="0" y="0" width="900" height="900"><feTurbulence type="fractalNoise" baseFrequency="0.0111" numOctaves="6" seed="7" stitchTiles="stitch"/>
<feColorMatrix type="matrix" values="0 0 0 0 .13  0 0 0 0 .115  0 0 0 0 .1  0 0 0 .9 -0.38"/></filter>
<filter id="g" filterUnits="userSpaceOnUse" x="0" y="0" width="900" height="900"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" stitchTiles="stitch"/>
<feColorMatrix type="matrix" values="0 0 0 0 .95  0 0 0 0 .9  0 0 0 0 .82  0 0 0 .3 -0.1"/></filter>
<filter id="v" filterUnits="userSpaceOnUse" x="0" y="0" width="900" height="900"><feTurbulence type="turbulence" baseFrequency="0.012 0.03" numOctaves="3" seed="11" stitchTiles="stitch"/>
<feColorMatrix type="matrix" values="0 0 0 0 .2  0 0 0 0 .18  0 0 0 0 .16  0 0 0 -1.2 .38"/></filter>
<rect width="900" height="900" fill="#110E0C"/>
<rect width="900" height="900" filter="url(#n)"/>
<rect width="900" height="900" filter="url(#v)" opacity=".18"/>
<rect width="900" height="900" filter="url(#g)"/>
</svg></body>`);
await p.waitForTimeout(500);
await sharp(await p.screenshot({ clip: { x: 0, y: 0, width: 900, height: 900 } })).webp({ quality: 72 }).toFile('public/images/texture/stone.webp');
// 2. Dust splashes: speckle clouds on transparent ground (seeded PRNG so output is stable).
for (const [name, seed] of [['dust-1', 4], ['dust-2', 19], ['dust-3', 33]]) {
  await p.setContent(`<body style="margin:0;background:transparent"><canvas id="c" width="900" height="900"></canvas></body>`);
  await p.evaluate((seed) => {
    let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const c = document.getElementById('c').getContext('2d');
    const blobs = Array.from({ length: 5 }, () => ({ x: 450 + (r() - .5) * 260, y: 450 + (r() - .5) * 200, rad: 140 + r() * 140 }));
    for (const bl of blobs) { // soft powder bed
      const g = c.createRadialGradient(bl.x, bl.y, 0, bl.x, bl.y, bl.rad);
      g.addColorStop(0, 'rgba(240,232,220,.2)'); g.addColorStop(.6, 'rgba(240,232,220,.05)'); g.addColorStop(1, 'rgba(240,232,220,0)');
      c.fillStyle = g; c.fillRect(0, 0, 900, 900);
    }
    for (let i = 0; i < 42000; i++) { // grains, denser towards blob centres
      const bl = blobs[Math.floor(r() * blobs.length)];
      const ang = r() * Math.PI * 2, d = Math.pow(r(), 1.7) * bl.rad * 1.35;
      const x = bl.x + Math.cos(ang) * d, y = bl.y + Math.sin(ang) * d * .85;
      const size = r() < .985 ? r() * 1.4 + .3 : r() * 3 + 1.2;
      c.fillStyle = `rgba(245,238,226,${(.25 + r() * .6) * (1 - d / (bl.rad * 1.4))})`;
      c.beginPath(); c.arc(x, y, size, 0, Math.PI * 2); c.fill();
    }
  }, seed);
  await sharp(await p.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: 900, height: 900 } })).webp({ quality: 80, alphaQuality: 80 }).toFile(`public/images/texture/${name}.webp`);
}
await b.close();
console.log('textures done');
