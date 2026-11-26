// ============================================================
//  YOUR SITE CONTENT: this is the only file you need to edit.
//  Save, refresh the page, done. The "ask" box also searches
//  this file, so anything you add becomes searchable automatically.
//  Lines marked TODO still need your input.
// ============================================================

window.PORTFOLIO = {
  name: "Adarsh Tailor",
  handle: "adarshtailor",
  status: "Open to opportunities in DFW or remote",
  headline: "Builder. AI engineer at RTR. Learning game dev.",
  tagline:
    "I build software people actually use. At work, that's ERICS, the AI platform about 300 coworkers rely on. On my own time, it's gesture-controlled windows, Unreal Engine, and small games. This site is where I keep track of all of it.",
  email: "Adarshtailor@icloud.com", // shows an "Email" button next to LinkedIn and GitHub; "" to hide it
  resumeUrl: "",  // optional: "resume.pdf" to add a Résumé link in the nav
  location: "Dallas-Fort Worth, TX",
  photo: "images/profile.jpg", // swap the file to change your photo, or "" to hide it

  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/adarshtailor/" },
    { label: "GitHub", url: "https://github.com/AdarshTailor" },
  ],

  // ----------------------------------------------------------
  //  NOW: what you're up to. Rewrite whenever things change.
  // ----------------------------------------------------------
  nowUpdated: "2026-11",
  now: [
    { k: "Up next", v: "Pinch: projecting my desktop onto a wall and moving windows around by pinching in the air." },
    { k: "Learning", v: "Unreal Engine, and building small games to try ideas quickly." },
    { k: "At work", v: "Running and growing ERICS at Real Time Resolutions." },
    { k: "Recently", v: "Graduated from UT Arlington (May 2026) and earned Azure AI Fundamentals (Oct 2026)." },
  ],

  // ----------------------------------------------------------
  //  NOTES: a running log. Add a new line at the TOP whenever
  //  something happens: a ship, a cert, a lesson, a small win.
  //  Add project: "Pinch" (the project's exact title) to make a note
  //  show up as that project's build log.
  // ----------------------------------------------------------
  log: [
    { date: "2026-10", text: "Earned Microsoft Certified: Azure AI Fundamentals (AI-901).", tag: "cert" },
    { date: "2026-05", text: "Graduated with a B.S. in Information Systems from UT Arlington and went full-time at Real Time Resolutions.", tag: "milestone" },
    { date: "2026", text: "Moved ERICS from Llama 3.3 70B to Qwen 3.8 27B (dense), served with vLLM on a 96GB RTX PRO 6000 Blackwell.", tag: "work" },
    { date: "2026", text: "Moved ERICS from Docker Compose to k3s and added Prometheus monitoring and CI/CD.", tag: "work" },
    { date: "2025-05", text: "Started as a Cybersecurity Analyst Intern, pitched on-prem AI to leadership, and got $12K to build it.", tag: "milestone" },
    { date: "2022-10", text: "Won 1st place in the McKesson challenge at HackDFW.", tag: "award" },
    { date: "2020-12", text: "Finished at UT Dallas and moved over to UT Arlington.", tag: "milestone" },
    { date: "2018-05", text: "Started college at UT Dallas. My first real programs were data structures in C/C++ on Linux and small Java apps (a change counter, a tip calculator).", tag: "milestone" },
    { date: "2016-09", text: "Started helping manage the family store, Nu-Way. This was my first hands-on IT: computers, networking and point-of-sale.", tag: "milestone" },
  ],

  // ----------------------------------------------------------
  //  ABOUT
  // ----------------------------------------------------------
  about:
    "I'm a builder based in Dallas. I studied Information Systems at UT Arlington, started out in cybersecurity, and ended up building my company's first AI platform. I like figuring out what people actually need, building it quickly, and owning it once it's live, whether that's an internal tool, a hardware experiment, or a small game.",
  // A line or two about you outside of tech: hobbies, what you're into. Shown under About.
  aboutPersonal: "", // TODO: e.g. "Outside of work I'm into ..."
  focus: [
    { title: "Tools people use every day", text: "Sitting with a team, finding the tedious part, and making it go away." },
    { title: "AI & automation", text: "Agents, search over documents, and the guardrails that make them trustworthy." },
    { title: "Interactive & 3D", text: "Gesture interfaces, small games, and learning Unreal Engine." },
    { title: "Infrastructure & security", text: "Linux, Kubernetes, monitoring, and keeping data where it belongs." },
  ],
  background: [
    { k: "Education", v: "B.S. Information Systems, The University of Texas at Arlington (May 2026). Before that: The University of Texas at Dallas (2018 to 2020)." },
    { k: "Certifications", v: "Microsoft Certified: Azure AI Fundamentals (AI-901), Oct 2026" },
    { k: "Based in", v: "Dallas-Fort Worth, open to on-site, hybrid, or remote" },
  ],

  skills: {
    Languages: ["Python", "SQL", "JavaScript", "Node.js", "Java", "C / C++", "Swift", "HTML / CSS"],
    "AI & automation": ["vLLM", "LangChain", "MCP", "RAGFlow", "n8n", "Microsoft Foundry", "Prompt engineering"],
    Infrastructure: ["Linux", "Kubernetes (k3s)", "Docker", "Prometheus", "GitHub CI/CD", "Azure"],
    Security: ["NIST", "ISO 27001", "Entra ID", "Active Directory", "Tines"],
    "Ways of working": ["Requirements discovery", "Rapid prototyping", "Owning it in production"],
    Learning: ["Unreal Engine", "Game development"],
  },

  // ----------------------------------------------------------
  //  PROJECTS: copy a { ... } block, paste it, fill it in.
  //  kind:   "personal" or "work" (shown in separate groups)
  //  status: "planned", "in progress", or "shipped"
  //  Featured ones show first, in the order listed here.
  // ----------------------------------------------------------
  projects: [
    {
      title: "Pinch",
      kind: "personal",
      status: "planned", // → "in progress" when you start, "shipped" when done
      date: "",
      featured: true,
      description:
        "Project my desktop onto a wall and move, resize, and arrange windows by pinching in the air, with an AI layer so I can say things like \"put these side by side.\"",
      metrics: [],
      highlights: [
        "Webcam hand tracking that turns pinches into window controls",
        "Voice or gesture commands handled by a local model",
      ],
      tags: ["Computer vision", "Hardware", "AI"],
      image: "",
      liveUrl: "",
      codeUrl: "",
    },
    {
      title: "HackDFW: Real-Time Medical Inventory",
      kind: "personal",
      status: "shipped",
      date: "2022-10",
      featured: false,
      description:
        "A hackathon app for tracking hospital staff and inventory, with a visit log so patients can see who came to their room and follow up with the right specialist.",
      metrics: [{ value: "1st", label: "McKesson challenge" }],
      highlights: ["JavaScript/jQuery, Node/Express and MySQL, deployed on AWS in Docker"],
      tags: ["Hackathon", "Full-stack"],
      image: "",
      liveUrl: "",
      codeUrl: "",
    },
    {
      title: "Smart Home Bridge (Apple HomeKit)",
      kind: "personal",
      status: "shipped",
      date: "", // TODO: add the year if you remember it (e.g. "2021")
      featured: false,
      description:
        "Brought devices that don't support Apple HomeKit, like a MyQ garage opener, into HomeKit with a Raspberry Pi, so the whole house could be controlled from one place.",
      metrics: [],
      highlights: ["Automations triggered by motion, geofencing, and manual input across the Raspberry Pi and Apple devices"],
      tags: ["Hardware", "Raspberry Pi", "Home automation"],
      image: "",
      liveUrl: "",
      codeUrl: "",
    },
    {
      title: "ERICS: Company AI Platform",
      kind: "work",
      status: "shipped",
      date: "2026-05",
      featured: true,
      description:
        "The internal AI platform at Real Time Resolutions. I pitched it, built it, and still run it solo. It answers questions from company documents, and no data leaves the network.",
      metrics: [
        { value: "~300", label: "users" },
        { value: "15", label: "departments" },
        { value: "$12K", label: "budget secured" },
      ],
      highlights: [
        "Self-hosted Qwen 3.8 27B (dense) on vLLM, migrated from Llama 3.3 70B",
        "Runs on k3s with Prometheus monitoring. Sensitive data is masked before it reaches the model.",
      ],
      tags: ["AI", "Infrastructure", "Security"],
      image: "",
      liveUrl: "",
      codeUrl: "",
    },
    {
      title: "Workflow Automations & Integrations",
      kind: "work",
      status: "shipped",
      date: "2026-06",
      featured: false,
      description:
        "I sat with departments one at a time, learned their daily work, then automated the tedious parts with agents and n8n, connected to Microsoft 365, SQL, and Tines.",
      metrics: [{ value: "100%", label: "of changes human-approved" }],
      highlights: ["Read-only database access and an approval step for every action, designed with the CISO"],
      tags: ["Automation", "AI", "Security"],
      image: "",
      liveUrl: "",
      codeUrl: "",
    },
    {
      title: "Document Classification Pipeline",
      kind: "work",
      status: "shipped",
      date: "2026-08",
      featured: false,
      description:
        "Automatically sorts incoming documents, with quality checks before each release and a daily review that suggests fixes for a person to approve.",
      metrics: [{ value: "97%", label: "accuracy" }],
      highlights: [],
      tags: ["AI", "Automation"],
      image: "",
      liveUrl: "",
      codeUrl: "",
    },
  ],

  // ----------------------------------------------------------
  //  PLAYGROUND: small games and quick experiments. Lighter than
  //  a project: title, one line, a link. Example:
  //  { title: "Marble Run", date: "2027-01", description: "My first Unreal scene: physics and a camera rig.", tags: ["Unreal"], url: "https://..." },
  // ----------------------------------------------------------
  playground: [],

  // Experience (newest first)
  experience: [
    {
      dates: "May 2026 to now",
      role: "Associate AI Analyst",
      org: "Real Time Resolutions, Inc.",
      summary: "Own the company's AI platform and workflow automations, from talking to teams through to running it in production.",
    },
    {
      dates: "May 2025 to May 2026",
      role: "Cybersecurity Analyst Intern",
      org: "Real Time Resolutions, Inc.",
      summary:
        "Ran a gap assessment across 700+ endpoints and raised compliance from 82% to 97% in 90 days. Coordinated a Windows 11 rollout to 700+ workstations with zero downtime. Pitched and launched the first AI platform.",
    },
    {
      dates: "Mar to May 2024",
      role: "IT Support Specialist",
      org: "Dossani Paradise",
      summary: "Wrote API scripts connecting Monday.com to daily reporting (25% faster tracking). Supported 50+ users and cut downtime by about 20%.",
    },
    {
      dates: "Jun to Aug 2023",
      role: "QA Intern",
      org: "Sysintelli Inc.",
      summary: "Wrote stress tests that pushed a patient-records system past 10,000 concurrent records. Detailed bug reports cut debugging time by about 25%.",
    },
    {
      dates: "2016 to 2024",
      role: "Manager, operations and IT",
      org: "Nu-Way, Joaquin, TX (family business)",
      summary:
        "Helped run the family store while in school. Set up the computers, networking and point-of-sale, managed finances and inventory, and grew sales 40 to 60% by reworking the layout and systems and cutting costs.",
    },
  ],

  // ----------------------------------------------------------
  //  ROADMAP: what you plan to build or learn next.
  //  status: "planned" → "in progress" → "done"
  // ----------------------------------------------------------
  roadmap: [
    { item: "Build Pinch: gesture-controlled projected windows", status: "planned" },
    { item: "Learn Unreal Engine and ship a small playable scene", status: "planned" },
    { item: "Make small games and experiments, and post them to the Playground", status: "planned" },
  ],

  // Shown under "Let's connect!". The buttons come from `links` above.
  contactBlurb:
    "Working on something cool, curious about one of my projects, or just want to swap ideas? I'm always up for a conversation.",
};
