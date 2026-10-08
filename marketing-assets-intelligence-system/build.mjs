// Bundles the deck into one self-contained index.html (fonts, styles and three.js inlined).
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const dir = new URL('.', import.meta.url).pathname;
const result = await build({
  entryPoints: [dir + 'src/main.js'],
  bundle: true,
  format: 'esm',
  minify: true,
  write: false,
  target: 'es2020',
  legalComments: 'none',
});
const js = result.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const css = readFileSync(dir + 'src/fonts.css', 'utf8') + readFileSync(dir + 'src/styles.css', 'utf8');

const icon = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='g' x1='0' y1='1' x2='1' y2='0'><stop offset='0' stop-color='#59c7fc'/><stop offset='1' stop-color='#16ffc6'/></linearGradient></defs><rect width='32' height='32' rx='7' fill='#0c1b24'/><circle cx='10' cy='11' r='3' fill='url(#g)'/><circle cx='22' cy='11' r='3' fill='#8fdcd2'/><circle cx='16' cy='22' r='3' fill='#f4efe6'/><path d='M10 11L22 11L16 22Z' fill='none' stroke='#8fdcd2' stroke-width='1.2'/></svg>`,
)}`;

const html = `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="description" content="A cinematic walkthrough of an intelligent creative operating system for multi-brand organisations." />
    <link rel="icon" href="${icon}" />
    <title>Marketing Assets Intelligence System</title>
    <style>${css}</style>
  </head>
  <body>
    <main class="viewport">
      <canvas aria-hidden="true"></canvas>
      <div class="stage" data-kind="cover">
        <div class="scrim scrim--edge"></div>
        <div class="scrim scrim--top"></div>
        <div class="scrim scrim--left"></div>
        <div class="scrim scrim--center"></div>
        <div class="labels" aria-hidden="true"></div>
      </div>
    </main>
    <script type="module">${js}</script>
  </body>
</html>
`;
writeFileSync(dir + 'index.html', html);
console.log(`index.html written (${(html.length / 1024).toFixed(0)} KB)`);
