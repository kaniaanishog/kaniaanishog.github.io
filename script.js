/* ==========================================================================
   script.js — renders the whole page from DATA (see data.js).
   Self-contained modules, no dependencies, no build step.
   ========================================================================== */
(function () {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  const root = document.documentElement;
  const tierChip = (t) => DATA.tiers[t]
    ? `<span class="chip tier-${esc(t)}" title="${esc(DATA.tiers[t].note)}">${esc(DATA.tiers[t].label)}</span>` : "";

  /* --- 1. theme ---------------------------------------------------------- */
  const savedTheme = store.get("ak-theme");
  if (savedTheme) root.dataset.theme = savedTheme;
  $("#themeBtn").addEventListener("click", () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    store.set("ak-theme", root.dataset.theme);
    schematic.repaint();
  });

  /* --- 2. page copy ------------------------------------------------------ */
  (function applyCopy() {
    const c = DATA.copy;
    $("#heroEyebrow").textContent  = c.eyebrow;
    $("#heroTitle").innerHTML      = esc(c.headline[0]) + "<em>" + esc(c.headline[1]) + "</em>";
    $("#heroLede").textContent     = c.lede;
    $("#standfirst").textContent   = c.standfirst;
    $("#ctaPrimary").textContent   = c.ctaPrimary.label;
    $("#ctaPrimary").href          = c.ctaPrimary.href;
    $("#ctaSecondary").textContent = c.ctaSecondary.label;
    $("#ctaSecondary").href        = c.ctaSecondary.href;
    $("#availability").textContent = c.availability;
    $("#contactHeading").innerHTML = esc(c.contactHeading[0]) + "<em>" + esc(c.contactHeading[1]) + "</em>";
    $("#contactLede").textContent  = c.contactBody;
    $("#contactCta").textContent   = c.contactCta;
  })();

  /* --- 3. status tiles --------------------------------------------------- */
  $("#tiles").innerHTML = DATA.status.map((t) => `
    <div class="tile">
      <div class="tile-top">
        <span class="mono">${esc(t.label)}</span>
        <span class="chip ${esc(t.status)}">${esc(t.status)}</span>
      </div>
      <div class="tile-val">${esc(t.value)}</div>
      <div class="tile-note">${esc(t.note)}</div>
    </div>`).join("");

  /* --- 4. the schematic — redraws for whichever system is selected -------- */
  const schematic = (function () {
    const cv = $("#topology");
    const ctx = cv.getContext("2d");
    let sys = null, nodes = [], edges = [], byId = {}, cols = 1, rows = 1;
    let W = 0, H = 0, packets = [], raf = null, visible = true;

    const css = (n) => getComputedStyle(root).getPropertyValue(n).trim() || "#888";

    function load(system) {
      sys = system;
      nodes = system.topology.nodes.map((n) => Object.assign({}, n));
      edges = system.topology.edges;
      byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
      cols = Math.max(...nodes.map((n) => n.col)) || 1;
      rows = Math.max(...nodes.map((n) => n.row)) || 1;
      packets = edges.map((_, i) => ({ e: i, off: Math.random(), speed: 0.20 + Math.random() * 0.18 }));
      layout();
      if (raf == null) draw(performance.now());
    }

    function layout() {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const padX = Math.max(48, W * 0.065), padY = 38;
      nodes.forEach((n) => {
        n.x = padX + (n.col / cols) * (W - padX * 2);
        n.y = padY + (n.row / rows) * (H - padY * 2);
      });
    }

    function shape(n, ink, accent, signal) {
      const s = 7;
      ctx.lineWidth = 1;
      if (n.kind === "edge") {
        ctx.strokeStyle = ink; ctx.beginPath();
        ctx.arc(n.x, n.y, s, 0, Math.PI * 2); ctx.stroke();
      } else if (n.kind === "control") {
        ctx.fillStyle = accent; ctx.fillRect(n.x - s, n.y - s, s * 2, s * 2);
      } else if (n.kind === "service") {
        ctx.fillStyle = ink; ctx.fillRect(n.x - s - 2, n.y - s + 1, (s + 2) * 2, (s - 1) * 2);
      } else {
        ctx.strokeStyle = signal; ctx.beginPath();
        ctx.moveTo(n.x, n.y - s - 1); ctx.lineTo(n.x + s + 1, n.y);
        ctx.lineTo(n.x, n.y + s + 1); ctx.lineTo(n.x - s - 1, n.y);
        ctx.closePath(); ctx.stroke();
      }
    }

    function draw(t) {
      if (!sys) return;
      const ink = css("--ink-3"), accent = css("--accent"),
            signal = css("--signal"), rule = css("--rule-strong"), label = css("--ink-2");
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = rule; ctx.lineWidth = 1;
      edges.forEach(([a, b]) => {
        const p = byId[a], q = byId[b];
        if (!p || !q) return;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      });

      if (!reduced) {
        packets.forEach((pk) => {
          const e = edges[pk.e]; if (!e) return;
          const p = byId[e[0]], q = byId[e[1]]; if (!p || !q) return;
          const u = (t / 1000 * pk.speed + pk.off) % 1;
          ctx.fillStyle = accent;
          ctx.globalAlpha = 0.5 + 0.45 * Math.sin(u * Math.PI);
          ctx.beginPath();
          ctx.arc(p.x + (q.x - p.x) * u, p.y + (q.y - p.y) * u, 2.1, 0, Math.PI * 2);
          ctx.fill(); ctx.globalAlpha = 1;
        });
      }

      const fs = W < 520 ? 8 : 10;
      nodes.forEach((n) => {
        shape(n, ink, accent, signal);
        ctx.fillStyle = label;
        ctx.font = fs + 'px "IBM Plex Mono", ui-monospace, monospace';
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(n.label.toUpperCase(), n.x, n.y + 13);
      });

      raf = (visible && !reduced) ? requestAnimationFrame(draw) : null;
    }

    addEventListener("resize", () => { layout(); if (raf == null) draw(performance.now()); });
    new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
      if (visible && raf == null && !reduced) raf = requestAnimationFrame(draw);
      else if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.05 }).observe(cv);

    return { load, repaint: () => { if (raf == null) draw(performance.now()); } };
  })();

  /* --- 5. system switcher: drives the schematic and the module map -------- */
  const switchHtml = DATA.systems.map((s, i) => `
    <button type="button" data-system="${esc(s.id)}" aria-pressed="${i === 0}">${esc(s.name)}</button>`).join("");
  $$(".system-switch").forEach((el) => { el.innerHTML = switchHtml; });

  let currentSystem = null;

  function setSystem(id) {
    const s = DATA.systems.find((x) => x.id === id);
    if (!s) return;
    currentSystem = s;

    $$(".system-switch button").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.system === id)));
    $("#schematicCaption").textContent = s.caption;
    $("#legend").innerHTML = s.topology.legend.map((l) =>
      `<li><span class="key ${esc(l.kind)}"></span>${esc(l.text)}</li>`).join("");
    schematic.load(s);

    $("#systemTitle").innerHTML = `${esc(s.full)} ${tierChip(s.tier)}`;
    $("#systemMeta").textContent = `${s.owner} · ${s.period}`;
    $("#systemSub").textContent = s.subtitle;
    $("#systemNote").textContent = s.note;

    $("#moduleList").innerHTML = s.modules.map((m, i) => `
      <button class="module-row" role="tab" type="button" data-id="${esc(m.no)}"
              aria-selected="${i === 0}" aria-controls="moduleDetail" tabindex="${i === 0 ? 0 : -1}">
        <span class="no">${esc(m.no)}</span>
        <span class="nm">${esc(m.name)}</span>
        <span class="own own-${esc(m.ownership)}">${m.ownership === "primary" ? "Primary" : "Contributing"}</span>
      </button>`).join("");
    showModule(s.modules[0].no);
  }

  function showModule(no) {
    const m = currentSystem.modules.find((x) => x.no === no);
    if (!m) return;
    $$("#moduleList .module-row").forEach((b) => {
      const on = b.dataset.id === no;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    $("#moduleDetail").innerHTML = `
      <span class="mono">Module ${esc(m.no)} · ${esc(m.group)}</span>
      <h3>${esc(m.name)}</h3>
      <p class="line">${esc(m.line)}</p>
      <p class="body">${esc(m.detail)}</p>
      ${m.owned ? `<p class="owned-note"><span class="mono">My primary ownership</span>${esc(m.owned)}</p>` : ""}
      <div class="entity-head"><span class="mono">${esc(currentSystem.entityLabel || "Principal entities")}</span>
        <ul class="entities">${m.entities.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
      </div>`;
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-system]");
    if (b) setSystem(b.dataset.system);
  });
  $("#moduleList").addEventListener("click", (e) => {
    const b = e.target.closest(".module-row");
    if (b) showModule(b.dataset.id);
  });
  $("#moduleList").addEventListener("keydown", (e) => {
    const dir = { ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const rows = $$("#moduleList .module-row");
    const i = rows.findIndex((r) => r.getAttribute("aria-selected") === "true");
    const next = rows[(i + dir + rows.length) % rows.length];
    showModule(next.dataset.id); next.focus();
  });

  /* --- 6. records -------------------------------------------------------- */
  const live = DATA.cases.filter((c) => c.published);

  $("#cases").innerHTML = live.map((c) => `
    <article class="case">
      <div class="case-bar">
        <span class="mono num no">${esc(c.no)}</span>
        <span class="mono">${esc(c.kicker)}</span>
        <span class="mono">${esc(c.sector)}</span>
        <span class="case-tier">${tierChip(c.tier)}</span>
      </div>
      <div class="case-body">
        <h3>${esc(c.title)}</h3>
        <p class="case-summary">${esc(c.summary)}</p>
        ${c.strip.length ? `<div class="strip">${c.strip.map((s) => `<span>${esc(s)}</span>`).join("<i>→</i>")}</div>` : ""}
        ${c.metrics.length ? `<div class="case-metrics">${c.metrics.map((m) => `
          <div><strong>${esc(m.value)}</strong><small>${esc(m.label)}</small></div>`).join("")}</div>` : ""}
        <div class="case-actions">
          <button class="btn btn-solid" type="button" data-case="${esc(c.id)}">Read the record</button>
          ${c.links.map((l) => `<a class="btn btn-line" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}
        </div>
      </div>
    </article>`).join("");

  /* --- 7. record modal, with a focus trap -------------------------------- */
  const modal = $("#recordModal");
  let lastFocus = null;
  const FIELDS = [
    ["Context", "context"], ["Constraint", "constraint"],
    ["Architecture", "architecture"], ["Rollout & scope", "rollout"],
    ["Outcome", "outcome", true], ["Trade-off I'd revisit", "tradeoff"]
  ];

  function openRecord(id) {
    const c = DATA.cases.find((x) => x.id === id);
    if (!c) return;
    lastFocus = document.activeElement;
    $("#modalKicker").innerHTML = `Record ${esc(c.no)} · ${esc(c.kicker)} ${tierChip(c.tier)}`;
    $("#modalTitle").textContent = c.title;
    $("#modalBody").innerHTML = `
      <p class="case-summary">${esc(c.summary)}</p>
      <div class="record">
        ${FIELDS.map(([label, key, wide]) => `
          <div class="field${wide ? " wide" : ""}">
            <span class="mono">${esc(label)}</span>
            <p>${esc(c[key])}</p>
          </div>`).join("")}
      </div>
      ${c.stack.length ? `<div class="strip">${c.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $("#modalClose").focus();
  }
  function closeRecord() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-case]");
    if (open) return openRecord(open.dataset.case);
    if (e.target.closest("[data-close]")) closeRecord();
  });
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") return closeRecord();
    if (e.key !== "Tab") return;
    const f = $$('a[href], button:not([disabled])', modal);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* --- 8. the incident --------------------------------------------------- */
  const inc = DATA.incident;
  $("#incidentTitle").textContent = inc.title;
  $("#incidentSituation").textContent = inc.situation;
  $("#incidentCause").textContent = inc.cause;
  $("#incidentSteps").innerHTML = inc.steps.map((s) => `
    <li class="inc-step">
      <span class="mono num">${esc(s.no)}</span>
      <div><strong>${esc(s.name)}</strong><p>${esc(s.line)}</p></div>
    </li>`).join("");
  $("#incidentWhy").textContent = inc.why;
  $("#incidentNote").textContent = inc.note;

  /* --- 9. reporting gallery — charts drawn to the scale ------------------ */
  function chart(shape, series) {
    const w = 100, h = 34, max = Math.max(...series) * 1.12;
    const x = (i) => (i / (series.length - 1)) * w;
    const y = (v) => h - (v / max) * h;

    if (shape === "line") {
      const pts = series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
      return `<svg viewBox="-1 -3 ${w + 2} ${h + 6}" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="0,${h} ${pts} ${w},${h}" fill="var(--accent-soft)"></polygon>
        <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="1.5" vector-effect="non-scaling-stroke"></polyline>
        <circle cx="${w}" cy="${y(series[series.length - 1]).toFixed(1)}" r="2.4" fill="var(--signal)"></circle>
      </svg>`;
    }
    const bw = w / series.length;
    if (shape === "stack") {
      return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${
        series.map((v, i) => {
          const top = y(v), split = top + (h - top) * 0.42;
          return `<rect x="${(i * bw + bw * .16).toFixed(1)}" y="${top.toFixed(1)}" width="${(bw * .68).toFixed(1)}" height="${(split - top).toFixed(1)}" fill="var(--accent)"></rect>
                  <rect x="${(i * bw + bw * .16).toFixed(1)}" y="${split.toFixed(1)}" width="${(bw * .68).toFixed(1)}" height="${(h - split).toFixed(1)}" fill="var(--accent-soft)"></rect>`;
        }).join("")}</svg>`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${
      series.map((v, i) =>
        `<rect x="${(i * bw + bw * .16).toFixed(1)}" y="${y(v).toFixed(1)}" width="${(bw * .68).toFixed(1)}" height="${(h - y(v)).toFixed(1)}" fill="var(--accent)" opacity="${(0.45 + 0.55 * (v / max)).toFixed(2)}"></rect>`).join("")}</svg>`;
  }

  $("#reports").innerHTML = DATA.reporting.map((r) => `
    <article class="report">
      <div class="report-top">
        <span class="mono">${esc(r.module)}</span>
        <span class="chip ${esc(r.state)}">${esc(r.state)}</span>
      </div>
      <div class="report-chart">${chart(r.shape, r.series)}</div>
      <div class="report-body">
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.line)}</p>
        <div class="report-foot"><span class="mono">${esc(r.unit)}</span></div>
      </div>
    </article>`).join("");

  /* --- 10. capability, AI practice, engagement, track, education --------- */
  $("#capabilityGrid").innerHTML = DATA.capability.map((c) => `
    <div class="cap">
      <div class="cap-head"><span class="mono">${esc(c.no)}</span><span class="conf">${esc(c.confidence)}</span></div>
      <h3>${esc(c.name)}</h3>
      <p>${esc(c.line)}</p>
      <ul>${c.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </div>`).join("");

  const ai = DATA.aiPractice;
  $("#aiPractice").innerHTML = `
    <div class="ai-head"><h3>${esc(ai.title)}</h3><p>${esc(ai.line)}</p></div>
    <ul class="ai-list">${ai.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    <p class="ai-caveat">${esc(ai.caveat)}</p>`;

  $("#trackList").innerHTML = DATA.track.map((t) => `
    <article class="track-item">
      <div><span class="mono">${esc(t.period)}</span></div>
      <div>
        <h3>${esc(t.org)}</h3>
        <p class="track-role">${esc(t.role)} · ${esc(t.place)}</p>
        <p class="body">${esc(t.line)}</p>
        <div class="tags">${t.tags.map((g) => `<span>${esc(g)}</span>`).join("")}</div>
      </div>
    </article>`).join("");

  $("#education").innerHTML = DATA.education.map((e) => `
    <div class="edu-item">
      <span class="mono">${esc(e.period)}</span>
      <h4>${esc(e.name)}</h4>
      <p>${esc(e.qual)}</p>
      <small>${esc(e.place)}${e.note ? " · " + esc(e.note) : ""}</small>
    </div>`).join("");

  $("#coursework").innerHTML = DATA.coursework.map((c) => `
    <li><span class="mono">${esc(c.code)}</span><span class="cw-name">${esc(c.name)}</span><span class="cw-grade num">${esc(c.grade)}</span></li>`).join("");

  const p = DATA.profile;
  $("#contactCard").innerHTML = [
    { note: "Email",      label: p.email, href: "mailto:" + p.email },
    { note: "LinkedIn",   label: "linkedin.com/in/kaniaanish", href: p.linkedin },
    { note: "Location",   label: p.location, href: null }
  ].map((r) => r.href
    ? `<a class="contact-row" href="${esc(r.href)}"${r.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>
         <span><span class="mono">${esc(r.note)}</span><br><strong>${esc(r.label)}</strong></span><span class="arrow">↗</span></a>`
    : `<div class="contact-row"><span><span class="mono">${esc(r.note)}</span><br><strong>${esc(r.label)}</strong></span></div>`
  ).join("");

  $("#contactCta").href = "mailto:" + p.email;
  $("#markName").textContent = p.name;
  $("#year").textContent = new Date().getFullYear();

  /* --- boot -------------------------------------------------------------- */
  setSystem(DATA.systems[0].id);
})();
