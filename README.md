# Adarsh Tailor: personal site

A personal site that shows what I've built, what I'm building, and the notes along the way. It has work and personal projects, a playground for small games and experiments, and an "ask" box: a small retrieval engine that runs in the browser and answers questions from the site's own content (no API, no backend, no cost).

No frameworks: plain HTML, CSS and JS, plus one tiny build command (`node build.mjs`).

## Files

| File | What it is | Edit it? |
|---|---|---|
| `data.js` | **All your content** | ✅ The only one you normally touch |
| `template.html` | Page structure | Rarely |
| `index.html` | The finished page, **generated** by `build.mjs` | ❌ Don't edit by hand |
| `styles.css` | Look and feel (change `--accent` to change the color) | Only to restyle |
| `render.js` | Turns `data.js` into HTML (used by the build and the browser) | No |
| `script.js` | Live behavior: filters, build logs, the ask box | No |
| `build.mjs` | Bakes `data.js` into `index.html` | No, just run it |

## After every edit: rebuild

```bash
node build.mjs
```

This writes your content straight into `index.html`, so the page works even without JavaScript (better for search engines and link previews). If you forget, visitors with JavaScript still see your latest `data.js`, but rebuild before you publish.

Search `data.js` for `TODO` to find what still needs your input.

## Keeping it fresh

| When… | Do this in `data.js` |
|---|---|
| Something happens (a ship, a lesson, a small win) | Add a line at the **top** of `log` |
| It's about a specific project | Add `project: "Pinch"` to that note. It then appears as the project's **build log**. |
| You start or finish a project | Change its `status`: `"planned"` → `"in progress"` → `"shipped"` |
| You make a small game or experiment | Add it to `playground` (title, one line, link) |
| Your focus changes | Rewrite `now` and update `nowUpdated` |
| You finish a roadmap item | Set its `status` to `"done"` (it gets crossed off) |

Everything you add is searchable in the ask box automatically.

### Project fields
- `kind`: `"personal"` or `"work"`, shown in separate groups
- `status`: `"planned"`, `"in progress"` or `"shipped"`
- `featured: true`: shows first in its group
- `metrics`: headline numbers, e.g. `{ value: "97%", label: "accuracy" }`
- `image`: a screenshot in `images/`, e.g. `"images/pinch.png"`. A GIF of Pinch in action would be great here.
- `liveUrl` / `codeUrl`: leave as `""` to hide

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Put it online for free (GitHub Pages)

1. Create a public GitHub repo named `<your-github-username>.github.io`.
2. Upload these files. If you ever want a résumé link or email button, set `resumeUrl` / `email` in `data.js`. Both are off by default.
3. In the repo, go to **Settings → Pages** and set the source to the `main` branch.
4. The site goes live at `https://<your-github-username>.github.io`.

To update later, edit `data.js`, run `node build.mjs`, then commit and push. The site updates in about a minute.
