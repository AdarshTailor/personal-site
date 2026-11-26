// Turns the content in data.js into HTML. Runs in two places:
//   1. build.mjs (Node) bakes it into index.html, so the page works without JavaScript
//   2. script.js (browser) re-renders filters, notes and the ask box live
// You shouldn't need to edit this file to add content.
(function (root) {
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Typographic quotes for prose: don't -> don’t, "x" -> “x”
  const smart = (s = "") => String(s).replace(/"([^"]*)"/g, "“$1”").replace(/'/g, "’");
  const txt = (s) => esc(smart(s));
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const chips = (arr) => (arr || []).map((t) => `<span class="chip">${txt(t)}</span>`).join("");
  const ext = (url) => (/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : "");

  const GROUPS = [["personal", "Personal builds"], ["work", "Work"]];
  const LOG_LIMIT = 5;

  // Featured first (in listed order), then newest
  function sortProjects(d) {
    return [...(d.projects || [])].sort(
      (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.featured ? 0 : String(b.date).localeCompare(String(a.date)))
    );
  }
  const allTags = (projects) => [...new Set(projects.flatMap((p) => p.tags || []))].sort();

  function filtersHTML(projects, activeTag = "all") {
    return ["all", ...allTags(projects)]
      .map((t) => `<button type="button" class="filter${t === activeTag ? " active" : ""}" data-tag="${esc(t)}" aria-pressed="${t === activeTag}">${txt(t)}</button>`)
      .join("");
  }

  function projectCard(p, d) {
    const img = p.image ? `<img class="eval-img" src="${esc(p.image)}" alt="${esc(p.title)} screenshot" loading="lazy" />` : "";
    const metrics = (p.metrics || []).length
      ? `<dl class="metrics">${p.metrics.map((m) => `<div class="metric"><dt>${txt(m.label)}</dt><dd>${txt(m.value)}</dd></div>`).join("")}</dl>`
      : "";
    const hl = (p.highlights || []).length ? `<ul>${p.highlights.map((h) => `<li>${txt(h)}</li>`).join("")}</ul>` : "";
    const nLog = (d.log || []).filter((l) => l.project === p.title).length;
    const links = [
      p.liveUrl && `<a href="${esc(p.liveUrl)}"${ext(p.liveUrl)}>Live demo</a>`,
      p.codeUrl && `<a href="${esc(p.codeUrl)}"${ext(p.codeUrl)}>Code</a>`,
      nLog && `<a href="#notes" class="buildlog-link" data-project="${esc(p.title)}">Build log (${nLog} note${nLog > 1 ? "s" : ""})</a>`,
    ].filter(Boolean).join("");
    const status = p.status && p.status !== "shipped" ? `<span class="badge badge-${slug(p.status)}">${txt(p.status)}</span>` : "";
    const meta = status || p.date ? `<p class="eval-id">${status}${p.date ? `<time>${esc(p.date)}</time>` : ""}</p>` : "";
    return `
      <article class="eval${img ? "" : " no-img"}" id="p-${slug(p.title)}">
        ${img}
        <div class="eval-body">
          ${meta}
          <h3>${txt(p.title)}</h3>
          <p>${txt(p.description)}</p>
          ${metrics}${hl}
          <div class="chips">${chips(p.tags)}</div>
          ${links ? `<div class="eval-links">${links}</div>` : ""}
        </div>
      </article>`;
  }

  function projectsHTML(d, activeTag = "all") {
    const projects = sortProjects(d);
    const list = activeTag === "all" ? projects : projects.filter((p) => (p.tags || []).includes(activeTag));
    return GROUPS.map(([k, label]) => {
      const items = list.filter((p) => (p.kind || "personal") === k);
      return items.length
        ? `<h3 class="group-title">${label} <span class="count">${items.length}</span></h3>${items.map((p) => projectCard(p, d)).join("")}`
        : "";
    }).join("");
  }

  function logHTML(d, { all = false, project = null } = {}) {
    const source = project ? (d.log || []).filter((l) => l.project === project) : d.log || [];
    const items = source.slice(0, all || project ? undefined : LOG_LIMIT);
    return (
      items
        .map(
          (l) => `<li><p class="when"><time>${esc(l.date)}</time>${l.tag ? `<span class="tag">${txt(l.tag)}</span>` : ""}${
            l.project ? `<span class="tag tag-project">${txt(l.project)}</span>` : ""
          }</p><p>${txt(l.text)}</p></li>`
        )
        .join("") +
      (!all && !project && source.length > LOG_LIMIT
        ? `<li><button type="button" class="log-more" id="log-more">Show all ${source.length} notes</button></li>`
        : "")
    );
  }

  function logLabelHTML(project) {
    return project ? `Build log for ${txt(project)}. <a href="#notes" id="log-clear">Show every note</a>` : "A running log.";
  }

  function playgroundHTML(d) {
    const play = d.playground || [];
    return play.length
      ? play
          .map(
            (g) => `<a class="play"${g.url ? ` href="${esc(g.url)}"${ext(g.url)}` : ""}>
            ${g.image ? `<img class="play-img" src="${esc(g.image)}" alt="${esc(g.title)}" loading="lazy" />` : ""}
            <span class="play-body">${g.date ? `<time>${esc(g.date)}</time>` : ""}<strong>${txt(g.title)}</strong><span class="play-desc">${txt(g.description || "")}</span><span class="chips">${chips(g.tags)}</span></span>
          </a>`
          )
          .join("")
      : `<p class="play-empty">Nothing here yet. Small games and experiments, starting with my first steps in Unreal Engine, will land here as I build them. Follow along in <a href="#notes">Notes</a>.</p>`;
  }

  // LinkedIn, GitHub, then Email: one filled button, the rest outlined
  function connectButtons(d) {
    const connect = [...(d.links || []), ...(d.email ? [{ label: "Email", url: `mailto:${d.email}` }] : [])];
    return connect
      .map((l, i) => `<a class="btn ${i === 0 ? "btn-primary" : "btn-ghost"}" href="${esc(l.url)}"${ext(l.url)}>${txt(l.label)}</a>`)
      .join("");
  }

  // Every slot in index.html, by id -> its inner HTML
  function parts(d) {
    const first = d.name.split(" ")[0];
    const projects = sortProjects(d);
    return {
      repo: txt(d.handle),
      "nav-extra": d.resumeUrl ? `<a href="${esc(d.resumeUrl)}"${ext(d.resumeUrl)}>Résumé</a>` : "",
      "photo-slot": d.photo ? `<img class="avatar" src="${esc(d.photo)}" alt="Photo of ${esc(d.name)}" width="96" height="96" />` : "",
      status: txt(d.status),
      name: txt(`hey, I'm ${first}.`),
      headline: txt(d.headline),
      tagline: txt(d.tagline),
      links: connectButtons(d),
      "now-updated": d.nowUpdated ? `Updated ${esc(d.nowUpdated)}.` : "",
      "now-list": (d.now || []).map((n) => `<div class="now-item"><h3 class="k">${txt(n.k)}</h3><p>${txt(n.v)}</p></div>`).join(""),
      "about-text": txt(d.about),
      "about-personal": txt(d.aboutPersonal || ""),
      focus: (d.focus || []).map((f) => `<div class="role"><h4>${txt(f.title)}</h4><p>${txt(f.text)}</p></div>`).join(""),
      background: `<dl class="kv">${(d.background || []).map((t) => `<dt>${txt(t.k)}</dt><dd>${txt(t.v)}</dd>`).join("")}</dl>`,
      skills: Object.entries(d.skills || {})
        .map(([k, items]) => `<div class="skill-row"><h3 class="k">${txt(k)}</h3><div class="chips">${chips(items)}</div></div>`)
        .join(""),
      filters: filtersHTML(projects),
      evals: projectsHTML(d),
      "playground-grid": playgroundHTML(d),
      "log-filter-label": logLabelHTML(null),
      log: logHTML(d),
      "experience-list": (d.experience || [])
        .map(
          (x) => `<li>
        <p class="ver"><time>${txt(x.dates)}</time></p>
        <div><h3>${txt(x.role)}</h3><p class="org">${txt(x.org)}</p><p>${txt(x.summary)}</p></div>
      </li>`
        )
        .join(""),
      roadmap: (d.roadmap || [])
        .map((r) => `<li><span class="rm-status rm-${slug(r.status || "planned")}">${txt(r.status || "planned")}</span><span class="rm-item">${txt(r.item)}</span></li>`)
        .join(""),
      "contact-blurb": txt(d.contactBlurb),
      "connect-links": connectButtons(d),
      footer: txt(`© ${new Date().getFullYear()} ${d.name}. Hand-built, no frameworks.`),
    };
  }

  root.Site = { esc, smart, txt, slug, sortProjects, filtersHTML, projectsHTML, logHTML, logLabelHTML, parts, LOG_LIMIT };
})(typeof window !== "undefined" ? window : globalThis);
