// Live behavior: refreshes content from data.js, project filters, build logs, and the "ask" box.
// The page's content is already baked into index.html by build.mjs; this adds interactivity.
// You shouldn't need to edit this file to add content.
(function () {
  const d = window.PORTFOLIO;
  const S = window.Site;
  const $ = (id) => document.getElementById(id);
  const { esc, slug } = S;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- REFRESH ----------------
     Re-render from data.js so the live page is current even if build.mjs wasn't re-run. */
  for (const [id, inner] of Object.entries(S.parts(d))) {
    const el = $(id);
    if (el) el.innerHTML = inner;
  }

  // Filters
  let activeTag = "all";
  function showProjects() {
    $("filters").innerHTML = S.filtersHTML(S.sortProjects(d), activeTag);
    $("evals").innerHTML = S.projectsHTML(d, activeTag);
  }
  $("filters").addEventListener("click", (e) => {
    const b = e.target.closest(".filter");
    if (!b) return;
    activeTag = b.dataset.tag;
    showProjects();
  });

  // Notes and per-project build logs
  let logProject = null;
  function showLog(all) {
    $("log-filter-label").innerHTML = S.logLabelHTML(logProject);
    $("log").innerHTML = S.logHTML(d, { all, project: logProject });
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("#log-more")) return showLog(true);
    if (e.target.closest("#log-clear")) { logProject = null; return showLog(false); }
    const a = e.target.closest(".buildlog-link");
    if (a) { logProject = a.dataset.project; showLog(true); }
  });

  /* ---------------- ASK: tiny search engine ----------------
     1. Tokenize the question, expand with synonyms, light stemming.
     2. Score projects + playground items by weighted term overlap.
     3. Route to a topic answer (contact, skills, now…) or the best matches.
  */
  const projects = S.sortProjects(d);
  const play = d.playground || [];
  const STOP = new Set("a an the is are was were be do does did i you your he his she her they their it its of to in on for with and or what which who how have has had can could would about me my tell show any some there this that from at as by please up".split(" "));
  const SYN = [
    ["ai", "ml", "llm", "llms", "model", "models", "genai", "nlp", "machine", "learning", "intelligence"],
    ["agent", "agents", "agentic", "tool", "mcp", "automation", "automate", "n8n", "workflow"],
    ["rag", "retrieval", "search", "document", "documents", "ragflow"],
    ["infra", "infrastructure", "kubernetes", "k3s", "docker", "deploy", "deployment", "devops", "serving", "vllm", "gpu", "production"],
    ["security", "secure", "privacy", "governance", "compliance", "ciso", "masking", "safety", "risk"],
    ["game", "games", "gaming", "unreal", "ue5", "gamedev", "3d", "playground", "experiment", "experiments"],
    ["gesture", "gestures", "pinch", "hand", "hands", "vision", "camera", "webcam", "projector", "projection", "hardware", "raspberry", "pi", "homekit", "smart", "home", "iot", "garage", "device", "devices"],
    ["hackathon", "hackdfw", "award", "win", "won", "prize"],
  ];
  const stem = (w) => w.replace(/(ing|ed|es|s)$/, (m) => (w.length - m.length >= 3 ? "" : m));
  const tokenize = (s) =>
    String(s).toLowerCase().replace(/['’]s\b/g, "").replace(/[^a-z0-9.+#\s-]/g, " ").split(/[\s-]+/).filter((w) => w.length > 1 && !STOP.has(w));
  const expand = (toks) => {
    const out = new Set(toks);
    toks.forEach((t) => SYN.forEach((g) => g.includes(t) && g.forEach((x) => out.add(x))));
    return [...out].map(stem);
  };

  const INTENTS = [
    {
      keys: ["contact", "email", "reach", "hire", "touch", "connect", "interview"],
      answer: () => ({
        text: `Let's connect! ${(d.links || []).map((l) => l.label).join(" or ")} ${d.email ? `or email (${d.email}) ` : ""}is the best way to reach me. I'm based in ${d.location}.`,
        refs: [["Let's connect", "#contact"], ...(d.links || []).map((l) => [l.label, l.url])],
      }),
    },
    {
      keys: ["resume", "cv"],
      answer: () => ({
        text: d.resumeUrl ? `You can grab my résumé from the link below.` : `My full background is on LinkedIn. Reach out there and I'm happy to share more.`,
        refs: d.resumeUrl ? [["Résumé", d.resumeUrl]] : (d.links || []).filter((l) => /linkedin/i.test(l.label)).map((l) => [l.label, l.url]),
      }),
    },
    {
      keys: ["now", "building", "currently", "current", "lately", "recent", "recently", "latest", "update", "news", "doing", "busy"],
      answer: () => ({
        text: `What I'm up to right now:\n${(d.now || []).map((n) => `  • ${n.k}: ${n.v}`).join("\n")}`,
        refs: [["Now", "#now"], ["Notes", "#notes"]],
      }),
    },
    {
      keys: ["next", "plan", "plans", "planning", "roadmap", "future", "goal", "goals", "learn", "learning", "game", "games", "gaming", "unreal", "engine", "gamedev"],
      answer: () => ({
        text: `What's next:\n${(d.roadmap || []).map((r) => `  • [${r.status}] ${r.item}`).join("\n")}`,
        refs: [["Roadmap", "#roadmap-section"], ["Playground", "#playground"]],
      }),
    },
    {
      keys: ["skill", "skills", "stack", "tech", "technology", "tools", "language", "languages", "know", "python"],
      answer: () => ({
        text: `Skills, grouped:\n${Object.entries(d.skills).map(([k, v]) => `  • ${k}: ${v.join(", ")}`).join("\n")}`,
        refs: [["Skills", "#skills-section"]],
      }),
    },
    {
      keys: ["who", "about", "yourself", "background", "interest", "interests", "like", "enjoy", "role", "roles", "looking", "open", "fit"],
      answer: () => ({
        text: `${d.about}\n\nWhat I like working on:\n${(d.focus || []).map((f) => `  • ${f.title}: ${f.text}`).join("\n")}`,
        refs: [["About", "#about"]],
      }),
    },
    {
      keys: ["school", "education", "degree", "university", "college", "study", "certification", "certified", "cert", "uta"],
      answer: () => ({ text: d.background.map((t) => `${t.k}: ${t.v}`).join("\n"), refs: [["About", "#about"]] }),
    },
    {
      keys: ["experience", "jobs", "job", "career", "company", "history", "rtr"],
      answer: () => ({
        text: `Experience, newest first:\n${d.experience.map((x) => `  • ${x.role} at ${x.org} (${x.dates})`).join("\n")}`,
        refs: [["Experience", "#experience"]],
      }),
    },
  ].map((it) => ({ ...it, keys: new Set(it.keys.map(stem)) }));

  // Index projects + playground
  const searchable = [...projects, ...play.map((g) => ({ ...g, _ref: "#playground" }))];
  const pDocs = searchable.map((p) => {
    const text = [p.title, p.description, ...(p.tags || []), ...(p.highlights || []), ...(p.metrics || []).map((m) => m.label)].join(" ");
    return { p, terms: new Set(tokenize(text).map(stem)), title: new Set(tokenize(p.title).map(stem)) };
  });
  const df = {};
  pDocs.forEach((doc) => doc.terms.forEach((t) => (df[t] = (df[t] || 0) + 1)));
  const idf = (t) => Math.log(1 + pDocs.length / (df[t] || pDocs.length));
  const GENERIC = new Set(["project", "projects", "built", "build", "made", "make", "example"].map(stem));

  function answer(q) {
    if (/\b(up to|working on|been doing|been up)\b/i.test(q)) {
      const now = INTENTS.find((it) => it.keys.has("now"));
      return { ...now.answer(), meta: "topic match (phrase)" };
    }
    if (/\b(at work|your job|day job|where do you work|who do you work for)\b/i.test(q)) {
      const exp = INTENTS.find((it) => it.keys.has("experience"));
      return { ...exp.answer(), meta: "topic match (phrase)" };
    }
    const raw = tokenize(q).map(stem);
    const terms = expand(tokenize(q));
    const exact = new Set(raw); // typed words: 3x (6x in a title); synonyms: 0.4x
    const bestIntent = INTENTS.map((it) => ({ it, s: raw.filter((t) => it.keys.has(t)).length * 5 })).sort((a, b) => b.s - a.s)[0];
    const scored = pDocs
      .map((doc) => ({ p: doc.p, s: terms.filter((t) => !GENERIC.has(t) && doc.terms.has(t)).reduce((a, t) => a + idf(t) * (exact.has(t) ? (doc.title.has(t) ? 6 : 3) : 0.4), 0) }))
      .map((x) => ({ ...x, s: x.p.status === "planned" ? x.s * 0.6 : x.s })) // built things rank above plans
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    const asksProjects = raw.some((t) => GENERIC.has(t));

    // A topic word ("stack", "contact") beats incidental matches in project text,
    // unless the question names a project or clearly asks about projects.
    const titleHit = pDocs.some((doc) => raw.some((t) => doc.title.has(t)));
    if (bestIntent.s > 0 && !(scored.length && (asksProjects || titleHit || scored[0].s > bestIntent.s * 2))) {
      return { ...bestIntent.it.answer(), meta: `topic match, score ${bestIntent.s.toFixed(1)}` };
    }
    const shipped = projects.filter((p) => p.status !== "planned");
    const picks = shipped.slice(0, 2);
    const personal = shipped.find((p) => p.kind === "personal" && !picks.includes(p));
    if (personal) picks.push(personal); else if (shipped[2]) picks.push(shipped[2]);
    const hits = scored.length ? scored.slice(0, 3).map((x) => x.p) : asksProjects ? picks : [];
    if (hits.length) {
      const lines = hits.map((p) => {
        const st = p.status && p.status !== "shipped" ? ` [${p.status}]` : "";
        const m = (p.metrics || []).slice(0, 2).map((x) => `${x.value} ${x.label}`).join(", ");
        return `  • ${p.title}${st}${m ? ` (${m})` : ""}\n    ${p.description}`;
      });
      return {
        text: `${hits.length === 1 ? "Here's the closest match" : `Here are the ${hits.length} closest matches`}:\n${lines.join("\n")}`,
        refs: hits.map((p) => [p.title, p._ref || `#p-${slug(p.title)}`]),
        meta: scored.length ? `${hits.length} of ${searchable.length} matched, top score ${scored[0].s.toFixed(2)}` : `showing highlights`,
      };
    }
    return {
      text: `Not sure about that one. Try asking what I've built, what I'm working on, or what's next. Or let's just connect.`,
      refs: [["Let's connect", "#contact"]],
      meta: "no match",
    };
  }

  const out = $("ask-out");
  let streamId = 0;
  async function run(q) {
    q = q.trim();
    if (!q) return;
    const id = ++streamId;
    const t0 = performance.now();
    const res = answer(q);
    const ms = (performance.now() - t0).toFixed(1);
    out.innerHTML = `<div class="q">&gt; ${esc(q)}</div><div class="meta"># ${esc(res.meta || "")}, ${ms}ms</div>\n<span class="a"></span><span class="cursor" aria-hidden="true"></span>`;
    const a = out.querySelector(".a");
    if (reduceMotion) a.textContent = res.text;
    else {
      for (let i = 0; i < res.text.length; i += 3) {
        if (id !== streamId) return;
        a.textContent = res.text.slice(0, i + 3);
        out.scrollTop = out.scrollHeight;
        await new Promise((r) => setTimeout(r, 8));
      }
    }
    if (id !== streamId) return;
    out.querySelector(".cursor")?.remove();
    if (res.refs?.length) {
      out.insertAdjacentHTML(
        "beforeend",
        `<div class="refs">${res.refs.map(([label, href]) => `<a href="${esc(href)}"${href.startsWith("#") ? "" : ' target="_blank" rel="noopener"'}>${esc(label)}</a>`).join("")}</div>`
      );
    }
  }

  out.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#p-"]');
    if (!a) return;
    activeTag = "all";
    showProjects();
    const el = document.querySelector(a.getAttribute("href"));
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      el.classList.add("flash");
      setTimeout(() => el.classList.remove("flash"), 1600);
    }
  });

  const SUGGESTED = ["What are you up to?", "What have you built?", "What's next?", "What's your stack?"];
  $("suggestions").innerHTML = SUGGESTED.map((s) => `<button type="button">${esc(s)}</button>`).join("");
  $("suggestions").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $("ask-input").value = b.textContent;
    run(b.textContent);
  });
  $("ask-form").addEventListener("submit", (e) => { e.preventDefault(); run($("ask-input").value); });

  out.innerHTML = `<span class="meta"># indexed ${projects.length} projects, ${(d.log || []).length} notes, ${play.length} experiments</span>\nHi, I'm ${esc(d.name.split(" ")[0])}. Ask what I've built, what I'm working on, or what's next.`;

  /* ---------------- TOC ---------------- */
  const tocLinks = [...document.querySelectorAll(".toc a")];
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) tocLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${en.target.id}`));
    }),
    { rootMargin: "-40% 0px -55% 0px" }
  );
  document.querySelectorAll(".card-body .section").forEach((s) => obs.observe(s));
})();
