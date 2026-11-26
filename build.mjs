// Bakes data.js into index.html so the page has real content even without JavaScript
// (better for search engines, link previews, and anyone whose scripts fail).
//
//   node build.mjs
//
// Run it after editing data.js, before you publish. Reads template.html, writes index.html.
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(read("./data.js"), ctx, { filename: "data.js" });
vm.runInContext(read("./render.js"), ctx, { filename: "render.js" });
const d = ctx.window.PORTFOLIO;
const parts = ctx.window.Site.parts(d);

let html = read("./template.html");
let filled = 0;
for (const [id, inner] of Object.entries(parts)) {
  // Each slot in template.html is an empty element: <tag ... id="x" ...></tag>
  const re = new RegExp(`(<(\\w+)\\b[^>]*\\bid="${id}"[^>]*>)(</\\2>)`);
  if (!re.test(html)) {
    console.warn(`  ! no empty slot with id="${id}" in template.html`);
    continue;
  }
  html = html.replace(re, (_, open, tag, close) => open + inner + close);
  filled++;
}
html = html.replace(/<title>[^<]*<\/title>/, `<title>${ctx.window.Site.esc(d.name)}</title>`);

writeFileSync(new URL("./index.html", import.meta.url), html);
console.log(`Built index.html: ${filled} sections filled from data.js`);
