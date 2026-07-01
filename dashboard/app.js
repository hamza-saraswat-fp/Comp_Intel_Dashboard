(function () {
  "use strict";
  var D = window.DATA;
  var view = document.getElementById("view");
  var sidebar = document.getElementById("sidebar");
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  if (!D) { view.textContent = "Data failed to load."; return; }

  var CHIP = { fieldpulse: "FP", servicetitan: "ST", "housecall-pro": "HP", jobber: "JB" };
  var SLABEL = { shipped: "Live", beta: "Beta", announced: "Announced", none: "None", not_researched: "Not assessed" };
  var DEPTH = { basic: { label: "Basic", n: 1 }, strong: { label: "Strong", n: 2 }, market_leading: { label: "Market-leading", n: 3 } };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var ICO = {
    overview: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1"/><rect x="9" y="1.5" width="4.5" height="4.5" rx="1"/><rect x="1.5" y="9" width="4.5" height="4.5" rx="1"/><rect x="9" y="9" width="4.5" height="4.5" rx="1"/></svg>',
    whatsnew: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M7.5 2.4c-1.9 0-3.1 1.4-3.1 3.2 0 2.9-1.2 3.6-1.2 3.6h8.6s-1.2-.7-1.2-3.6c0-1.8-1.2-3.2-3.1-3.2z"/><path d="M6.3 11.2a1.3 1.3 0 0 0 2.4 0"/></svg>',
    lens: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M7.5 1.8 13.4 5 7.5 8.2 1.6 5z"/><path d="M1.9 8 7.5 11 13.1 8"/></svg>'
  };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmtDate(s) { if (!s) return ""; var p = s.split("-"); return MONTHS[+p[1] - 1] + " " + +p[2] + ", " + p[0]; }
  function firstSentence(s) { if (!s) return ""; var m = s.match(/^.*?[.!?](?=\s|$)/); return m ? m[0] : s; }

  var caps = D.capabilities.slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
  var TOTAL = caps.length;
  var capBySlug = {}; caps.forEach(function (c) { capBySlug[c.slug] = c; });
  var compBySlug = {}; D.competitors.forEach(function (c) { compBySlug[c.slug] = c; });
  var offMap = {}; D.offerings.forEach(function (o) { offMap[o.competitor + "::" + o.capability] = o; });
  function off(c, cap) { return offMap[c + "::" + cap]; }

  function stats(slug) {
    var s = { shipped: 0, beta: 0, announced: 0, none: 0, na: 0, ml: 0 };
    caps.forEach(function (cap) {
      var o = off(slug, cap.slug); if (!o) return;
      if (o.status === "shipped") s.shipped++; else if (o.status === "beta") s.beta++;
      else if (o.status === "announced") s.announced++; else if (o.status === "none") s.none++; else s.na++;
      if (o.depth === "market_leading") s.ml++;
    });
    return s;
  }
  var fp = D.competitors.filter(function (c) { return c.is_fieldpulse; })[0];
  var rivals = D.competitors.filter(function (c) { return !c.is_fieldpulse; }).sort(function (a, b) {
    var sa = stats(a.slug), sb = stats(b.slug); return (sb.shipped - sa.shipped) || (sb.ml - sa.ml);
  });
  var ORDER = [fp].concat(rivals);
  var leader = rivals[0];

  function stClass(o) { if (o.status === "shipped") return o.depth === "market_leading" ? "st-lead" : "st-live"; return "st-" + ({ beta: "beta", announced: "ann", none: "none", not_researched: "na" }[o.status]); }
  function stOverview(o) {
    if (o.status === "not_researched") return '<span class="st st-na"><span class="st-dot"></span>Pending</span>';
    var l = o.status === "shipped" ? (o.depth === "market_leading" ? "Leading" : "Live") : SLABEL[o.status];
    return '<span class="st ' + stClass(o) + '"><span class="st-dot"></span>' + l + "</span>";
  }
  function stFull(o) { var l = o.status === "not_researched" ? "Not assessed" : SLABEL[o.status]; return '<span class="st ' + stClass(o) + '"><span class="st-dot"></span>' + l + "</span>"; }
  function matEl(depth) { if (!depth) return ""; var n = DEPTH[depth].n, d = ""; for (var i = 1; i <= 3; i++) d += '<span class="mat-dot' + (i <= n ? " on" : "") + '"></span>'; return '<span class="mat"><span class="mat-dots">' + d + '</span><span class="mat-label">' + DEPTH[depth].label + "</span></span>"; }
  function srcLinks(o) {
    var arr = (o.sources && o.sources.length) ? o.sources : (o.primary_source ? [{ title: o.primary_source, url: o.primary_source }] : []);
    if (!arr.length) return "";
    return '<div class="player-src">' + arr.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + "</a>"; }).join("") + "</div>";
  }
  function chipEl(c, cls) { return '<span class="' + cls + (c.is_fieldpulse ? " fp" : "") + '">' + esc(CHIP[c.slug]) + "</span>"; }
  function score(o) { if (o.status === "shipped") return o.depth === "market_leading" ? 4 : o.depth === "strong" ? 3 : 2; if (o.status === "beta") return 2; if (o.status === "announced") return 1; if (o.status === "none") return 0; return -1; }

  function renderSidebar() {
    var comps = ORDER.map(function (c) { return '<a class="nav-item" data-route="competitor/' + c.slug + '" href="#/competitor/' + c.slug + '">' + chipEl(c, "nav-chip") + esc(c.name) + "</a>"; }).join("");
    var lens = caps.map(function (cap) { var lbl = cap.title.replace(/^AI\s+/, "").replace(/\s*\(emerging\)$/, ""); return '<button class="nav-item nav-cap" data-cap="' + cap.slug + '"><span class="nav-ic">' + ICO.lens + "</span>" + esc(lbl) + "</button>"; }).join("");
    sidebar.innerHTML =
      '<div class="sb-brand"><img src="./assets/fp-icon.svg" alt="FieldPulse"><div><div class="bt">Competitor Intel</div><div class="bs">AI capability watch</div></div></div>' +
      '<a class="nav-item" data-route="overview" href="#/overview"><span class="nav-ic">' + ICO.overview + "</span>Overview</a>" +
      '<a class="nav-item" data-route="whatsnew" href="#/whatsnew"><span class="nav-ic">' + ICO.whatsnew + "</span>What's new</a>" +
      '<div class="nav-sec">Competitors</div>' + comps +
      '<div class="nav-sec">Capability lens</div>' + lens +
      '<div class="sb-foot">As of ' + esc(fmtDate(D.generated_at)) + "<br>Sourced from the OKF knowledge base</div>";
  }

  function renderOverview() {
    var rest = rivals.slice(1).map(function (c) { return c.name; });
    var restStr = rest.length === 2 ? rest[0] + " and " + rest[1] : rest.join(", ");
    var head =
      '<div class="view-head"><h1>AI competitive landscape</h1>' +
      '<p class="verdict"><span class="hl">' + esc(leader.name) + " sets the AI pace</span>, the only player shipping true ML dispatch. " + esc(restStr) + " are close behind on nearly everything else.</p>" +
      '<p class="view-meta">' + ORDER.length + " players · " + TOTAL + " capabilities · click any capability to compare all four</p></div>";

    var th = '<tr><th class="cap-h">Capability</th>';
    ORDER.forEach(function (c) {
      var s = stats(c.slug);
      var tally = c.is_fieldpulse ? "pending" : (s.shipped + " live" + (s.ml ? " · " + s.ml + " leading" : ""));
      th += '<th class="pl-h' + (c.is_fieldpulse ? " home" : "") + '"><a class="plh" href="#/competitor/' + c.slug + '">' + chipEl(c, "nav-chip") + '<span class="pname">' + esc(c.name) + "</span></a><div class=\"ptally\">" + tally + "</div></th>";
    });
    th += "</tr>";
    var rows = caps.map(function (cap, i) {
      var tds = ORDER.map(function (c) { return '<td class="cell">' + stOverview(off(c.slug, cap.slug)) + "</td>"; }).join("");
      return '<tr class="reveal" style="animation-delay:' + (i * 34) + 'ms" data-cap="' + cap.slug + '" tabindex="0" role="button" aria-label="Compare all four on ' + esc(cap.title) + '"><td class="capcell"><span class="capname">' + esc(cap.title) + '<span class="capchev">→</span></span></td>' + tds + "</tr>";
    }).join("");

    var legend =
      '<div class="legend"><span class="lgkey">Status</span><span class="grp">' +
      '<span class="lg"><span class="st st-lead"><span class="st-dot"></span></span>Leading</span>' +
      '<span class="lg"><span class="st st-live"><span class="st-dot"></span></span>Live</span>' +
      '<span class="lg"><span class="st st-beta"><span class="st-dot"></span></span>Beta</span>' +
      '<span class="lg"><span class="st st-ann"><span class="st-dot"></span></span>Announced</span>' +
      '<span class="lg"><span class="st st-none"><span class="st-dot"></span></span>None</span>' +
      '<span class="lg"><span class="st st-na"><span class="st-dot"></span></span>Pending</span>' +
      '</span><span class="sep"></span><span class="lgkey">Depth</span><span class="lg"><span class="mat"><span class="mat-dots"><span class="mat-dot on"></span><span class="mat-dot on"></span><span class="mat-dot on"></span></span></span>basic → market-leading</span></div>';

    view.innerHTML = head + '<div class="ov-wrap"><table class="ov"><thead>' + th + "</thead><tbody>" + rows + "</tbody></table></div>" + legend;
  }

  function renderWhatsNew() {
    view.innerHTML =
      '<div class="view-head"><h1>What\'s new</h1><p class="view-sub">Competitor AI moves, newest first. Significant launches will wear the accent; routine updates stay quiet.</p></div>' +
      '<div class="empty reveal"><div class="pulse"></div><h3>Monitoring is live</h3><p>No competitor AI moves have been flagged yet. When the monitor detects a change on a competitor’s site, it lands here with its date, capability, and source.</p></div>';
  }

  function renderCompetitor(slug) {
    var c = compBySlug[slug]; if (!c) return renderOverview();
    var s = stats(slug);
    var tiles = c.is_fieldpulse
      ? '<div class="stat"><div class="stat-n dim">' + TOTAL + '</div><div class="stat-l">capabilities to assess</div></div>'
      : '<div class="stat"><div class="stat-n">' + s.shipped + '</div><div class="stat-l">of ' + TOTAL + ' shipped</div></div><div class="stat"><div class="stat-n">' + s.ml + '</div><div class="stat-l">market-leading</div></div><div class="stat"><div class="stat-n">' + (s.none + s.na) + '</div><div class="stat-l">gaps</div></div>';
    var pchip = c.is_fieldpulse ? '<span class="chip-pending">Not yet assessed</span>' : (c === leader ? '<span class="chip-lead">Pace-setter</span>' : '<span class="chip-follow">Fast follower</span>');

    var rows = caps.map(function (cap, i) {
      var o = off(slug, cap.slug);
      var note = c.is_fieldpulse ? "Not yet assessed internally. Shown for an honest gap read, never inflated." : firstSentence(o.assessment);
      var side = c.is_fieldpulse
        ? '<div class="caprow-side">' + stFull(o) + '<span class="caprow-verify">Needs verification</span></div>'
        : '<div class="caprow-side">' + stFull(o) + (o.depth ? matEl(o.depth) : "") + '<span class="caprow-meta">Verified ' + esc(fmtDate(o.as_of)) + "</span>" + (o.needs_verification ? '<span class="caprow-verify">Needs verification</span>' : "") + "</div>";
      return '<div class="caprow reveal" style="animation-delay:' + (i * 30) + 'ms" data-cap="' + cap.slug + '" data-from="' + slug + '" tabindex="0" role="button" aria-label="' + esc(cap.title) + ', open detail"><div class="caprow-main"><span class="caprow-name">' + esc(cap.title) + '<span class="caprow-chev">→</span></span><p class="caprow-note">' + esc(note) + "</p></div>" + side + "</div>";
    }).join("");

    view.innerHTML =
      '<a class="crumb" href="#/overview">← Overview</a>' +
      '<div class="view-head"><h1>' + esc(c.name) + " " + pchip + '</h1><p class="view-sub">' + (c.is_fieldpulse ? "FieldPulse’s own position, shown honestly." : "How " + esc(c.name) + " stacks up across the " + TOTAL + " AI capabilities. Click any row for the full comparison and sources.") + "</p><div class=\"stats\">" + tiles + "</div></div>" +
      '<div class="summary">' + esc(c.summary) + "</div>" +
      '<div class="sec-title">Capabilities</div><div class="caps">' + rows + "</div>";
  }

  /* Capability slide-out */
  var lastFocus = null;
  function openCapability(slug, fromComp) {
    var cap = capBySlug[slug]; if (!cap) return;
    var ranked = ORDER.slice().sort(function (a, b) { return score(off(b.slug, slug)) - score(off(a.slug, slug)); });
    var players = ranked.map(function (c, i) {
      var o = off(c.slug, slug);
      var isLead = i === 0 && score(o) > 0;
      var cls = "player reveal" + (c.is_fieldpulse ? " home" : "") + (c.slug === fromComp ? " from" : (isLead ? " lead" : ""));
      var body = c.is_fieldpulse
        ? '<p class="player-assess">Not yet assessed internally, flagged for verification. Shown for an honest gap read, never inflated.</p>'
        : '<p class="player-assess">' + esc(o.assessment) + "</p>" + srcLinks(o);
      return '<div class="' + cls + '" style="animation-delay:' + (i * 40) + 'ms"><div class="player-head"><span class="player-rank">' + (i + 1) + "</span>" + chipEl(c, "player-chip") + '<span class="player-name">' + esc(c.name) + '</span><span class="player-badges">' + stFull(o) + (o.depth ? matEl(o.depth) : "") + "</span></div>" + body + "</div>";
    }).join("");
    drawer.innerHTML =
      '<div class="dw-top"><div><p class="dw-kicker">Capability</p><h2 class="dw-title">' + esc(cap.title) + '</h2><p class="dw-blurb">' + esc(cap.blurb) + '</p></div><button class="dw-close" aria-label="Close">×</button></div>' +
      (cap.overall ? '<div class="dw-sotf">' + esc(cap.overall) + "</div>" : "") +
      '<div class="dw-sec">All four players, ranked by depth</div><div class="players">' + players + "</div>";
    showDrawer();
  }
  function showDrawer() {
    lastFocus = document.activeElement;
    scrim.hidden = false; drawer.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add("open"); drawer.classList.add("open"); });
    drawer.setAttribute("aria-hidden", "false");
    var btn = drawer.querySelector(".dw-close");
    if (btn) { btn.addEventListener("click", closeDrawer); btn.focus(); }
    document.addEventListener("keydown", onKey);
  }
  function closeDrawer() {
    scrim.classList.remove("open"); drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKey);
    setTimeout(function () { if (!drawer.classList.contains("open")) { drawer.hidden = true; scrim.hidden = true; } }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") return closeDrawer();
    if (e.key === "Tab") {
      var f = drawer.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"])'); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  scrim.addEventListener("click", closeDrawer);

  function setActive(key) { Array.prototype.forEach.call(sidebar.querySelectorAll(".nav-item"), function (a) { a.classList.toggle("active", a.getAttribute("data-route") === key); }); }
  function render() {
    var h = location.hash.replace(/^#\/?/, ""); var p = h.split("/"); var v = p[0] || "overview";
    if (v === "competitor" && p[1]) { renderCompetitor(p[1]); setActive("competitor/" + p[1]); }
    else if (v === "whatsnew") { renderWhatsNew(); setActive("whatsnew"); }
    else { renderOverview(); setActive("overview"); }
    window.scrollTo(0, 0); view.focus();
  }

  document.body.addEventListener("click", function (e) {
    var capEl = e.target.closest("[data-cap]");
    if (capEl && !drawer.contains(capEl)) { e.preventDefault(); openCapability(capEl.getAttribute("data-cap"), capEl.getAttribute("data-from")); }
  });
  document.body.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var capEl = e.target.closest("[data-cap]");
    if (capEl && !drawer.contains(capEl) && capEl.tagName !== "BUTTON") { e.preventDefault(); openCapability(capEl.getAttribute("data-cap"), capEl.getAttribute("data-from")); }
  });

  renderSidebar();
  window.addEventListener("hashchange", render);
  render();
})();
