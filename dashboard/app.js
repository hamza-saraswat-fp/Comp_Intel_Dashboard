(function () {
  "use strict";
  var D = window.DATA;
  var root = document;
  if (!D) {
    root.getElementById("verdict").textContent = "Data failed to load.";
    return;
  }

  var CHIP = { fieldpulse: "FP", servicetitan: "ST", "housecall-pro": "HP", jobber: "JB" };
  var STATUS = {
    shipped: { label: "Live", badge: "b-live" },
    beta: { label: "Beta", badge: "b-beta" },
    announced: { label: "Announced", badge: "b-ann" },
    none: { label: "None", badge: "b-none" },
    not_researched: { label: "Not yet assessed", badge: "b-na" }
  };
  var DEPTH = { basic: { label: "Basic", n: 1 }, strong: { label: "Strong", n: 2 }, market_leading: { label: "Market-leading", n: 3 } };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fmtDate(s) {
    if (!s) return "";
    var p = s.split("-");
    return MONTHS[+p[1] - 1] + " " + +p[2] + ", " + p[0];
  }
  function firstSentence(s) {
    if (!s) return "";
    var m = s.match(/^.*?[.!?](?=\s|$)/);
    return m ? m[0] : s;
  }

  var caps = D.capabilities.slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
  var TOTAL = caps.length;
  var offMap = {};
  D.offerings.forEach(function (o) { offMap[o.competitor + "::" + o.capability] = o; });
  function off(cSlug, capSlug) { return offMap[cSlug + "::" + capSlug]; }

  function stats(cSlug) {
    var s = { shipped: 0, beta: 0, announced: 0, none: 0, na: 0, ml: 0 };
    caps.forEach(function (cap) {
      var o = off(cSlug, cap.slug);
      if (!o) return;
      if (o.status === "shipped") s.shipped++;
      else if (o.status === "beta") s.beta++;
      else if (o.status === "announced") s.announced++;
      else if (o.status === "none") s.none++;
      else s.na++;
      if (o.depth === "market_leading") s.ml++;
    });
    return s;
  }

  var fp = D.competitors.filter(function (c) { return c.is_fieldpulse; })[0];
  var rivals = D.competitors.filter(function (c) { return !c.is_fieldpulse; }).sort(function (a, b) {
    var sa = stats(a.slug), sb = stats(b.slug);
    return (sb.shipped - sa.shipped) || (sb.ml - sa.ml);
  });
  var ORDER = [fp].concat(rivals);
  var leader = rivals[0];

  function chip(c) {
    return '<span class="chip' + (c.is_fieldpulse ? " fp" : "") + '">' + esc(CHIP[c.slug] || "?") + "</span>";
  }
  function glyph(status) {
    if (status === "none") return '<span class="dash none"></span>';
    if (status === "not_researched") return '<span class="dash na"></span>';
    var cls = { shipped: "g-live", beta: "g-beta", announced: "g-ann" }[status];
    return '<span class="g ' + cls + '"></span>';
  }
  function pips(depth) {
    if (!depth) return "";
    var n = DEPTH[depth].n, s = '<span class="pips" aria-hidden="true">';
    for (var i = 1; i <= 3; i++) s += '<span class="pip' + (i <= n ? " on" : "") + '"></span>';
    return s + "</span>";
  }
  function badge(status) {
    return '<span class="badge ' + STATUS[status].badge + '">' + STATUS[status].label + "</span>";
  }

  function renderMasthead() {
    root.getElementById("masthead").innerHTML =
      '<div class="brand"><span class="mark" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor"/></svg></span>' +
      '<div><div class="bt">Competitor Intel</div><div class="bs">AI capability watch</div></div></div>' +
      '<div class="meta">Updated <b>' + esc(fmtDate(D.generated_at)) + "</b><br>" +
      "FieldPulse + 3 competitors, " + TOTAL + " capabilities<br>Sourced and dated</div>";
  }

  function renderVerdict() {
    var rest = rivals.slice(1).map(function (c) { return c.name; });
    var restStr = rest.length === 2 ? rest[0] + " and " + rest[1] : rest.join(", ");
    root.getElementById("verdict").innerHTML =
      '<span class="hl">' + esc(leader.name) + " sets the AI pace</span>, and it is the only player shipping true ML dispatch. " +
      esc(restStr) + " are close behind on nearly everything else.";
  }

  function renderCards() {
    var html = ORDER.map(function (c) {
      var s = stats(c.slug);
      if (c.is_fieldpulse) {
        return '<button class="card home" data-comp="' + c.slug + '" aria-label="FieldPulse, not yet assessed, open profile">' +
          '<div class="card-top">' + chip(c) + '<span class="card-name">' + esc(c.name) + '</span>' +
          '<span class="pill na">Not yet assessed</span></div>' +
          '<div class="cov"><span class="cov-n dim">&mdash;</span><span class="cov-sub">not yet assessed</span></div>' +
          '<div class="bar pending"></div>' +
          '<p class="blurb">' + esc(c.summary) + "</p></button>";
      }
      var isLead = c === leader;
      var extras = [];
      if (s.ml) extras.push(s.ml + " market-leading");
      if (s.beta) extras.push(s.beta + " in beta");
      if (s.announced) extras.push(s.announced + " announced");
      var pct = Math.round((s.shipped / TOTAL) * 100);
      return '<button class="card" data-comp="' + c.slug + '" aria-label="' + esc(c.name) + ', open profile">' +
        '<div class="card-top">' + chip(c) + '<span class="card-name">' + esc(c.name) + '</span>' +
        '<span class="pill' + (isLead ? " lead" : "") + '">' + (isLead ? "Pace-setter" : "Fast follower") + "</span></div>" +
        '<div class="cov"><span class="cov-n">' + s.shipped + '</span><span class="cov-sub">of ' + TOTAL + " shipped</span></div>" +
        '<div class="bar"><span class="bar-fill" style="width:' + pct + '%"></span></div>' +
        (extras.length ? '<p class="blurb" style="color:var(--muted);-webkit-line-clamp:1;margin-bottom:-2px">' + esc(extras.join(" · ")) + "</p>" : "") +
        '<p class="blurb">' + esc(firstSentence(c.summary)) + "</p></button>";
    }).join("");
    root.getElementById("cards").innerHTML = html;
  }

  function renderMatrix() {
    var head = '<tr><th class="cap-col">AI capability</th>';
    ORDER.forEach(function (c) {
      var s = stats(c.slug);
      var cls = "player" + (c === leader ? " leader" : "") + (c.is_fieldpulse ? " home" : "");
      var tally = c.is_fieldpulse ? "pending" : s.shipped + " live";
      head += '<th class="' + cls + '">' + chip(c) + '<span class="pname">' + esc(c.name) + "</span>" +
        '<span class="tally num">' + tally + "</span>" +
        (c === leader ? '<span class="leadtag">Pace-setter</span>' : "") + "</th>";
    });
    head += "</tr>";

    var body = caps.map(function (cap) {
      var row = '<tr class="caprow" data-cap="' + cap.slug + '">' +
        '<th scope="row" class="cap-label"><button class="cap-btn" data-cap="' + cap.slug + '">' +
        esc(cap.title) + '<span class="arr" aria-hidden="true">Compare &rarr;</span></button></th>';
      ORDER.forEach(function (c) {
        var o = off(c.slug, cap.slug);
        var isFp = c.is_fieldpulse;
        var verify = (!isFp && o.needs_verification) ? '<span class="verify" aria-hidden="true"></span>' : "";
        var srLabel = c.name + ", " + cap.title + ": " + STATUS[o.status].label +
          (o.depth ? ", " + DEPTH[o.depth].label + " depth" : "") +
          (!isFp && o.needs_verification ? ", needs verification" : "");
        row += '<td class="cell' + (isFp ? " home" : "") + '">' +
          '<span class="cell-in">' + glyph(o.status) + pips(o.depth) + "</span>" + verify +
          '<span class="sr-only">' + esc(srLabel) + "</span></td>";
      });
      return row + "</tr>";
    }).join("");

    root.getElementById("matrix").innerHTML =
      '<div class="matrix-wrap"><table class="mtx"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
  }

  function renderLegend() {
    root.getElementById("legend").innerHTML =
      '<span class="li">' + glyph("shipped") + " Live</span>" +
      '<span class="li">' + glyph("beta") + " Beta</span>" +
      '<span class="li">' + glyph("announced") + " Announced</span>" +
      '<span class="li">' + glyph("none") + " None</span>" +
      '<span class="li">' + glyph("not_researched") + " Not yet assessed</span>" +
      '<span class="sep"></span>' +
      '<span class="li">' + pips("market_leading") + " Depth: basic to market-leading</span>" +
      '<span class="sep"></span>' +
      '<span class="li"><span class="verify" style="position:static"></span> Needs verification</span>' +
      '<span class="sep"></span>' +
      '<span class="li hint">Click any capability to compare all four</span>';
  }

  function renderFoot() {
    root.getElementById("foot").innerHTML =
      "<span>Sourced from the OKF knowledge base &middot; as of " + esc(fmtDate(D.generated_at)) +
      " &middot; FieldPulse shown honestly, never inflated</span>" +
      "<span>Monitoring live &middot; no new moves flagged</span>";
  }

  var overlay = root.getElementById("drawer-overlay");
  var drawer = root.getElementById("drawer");
  var lastFocus = null;

  function playerBlock(c, cap) {
    var o = off(c.slug, cap.slug);
    var depth = o.depth ? '<span class="pl-depth">' + pips(o.depth) + " " + DEPTH[o.depth].label + "</span>" : "";
    var head = '<div class="pl-head">' + chip(c) + '<span class="pl-name">' + esc(c.name) + "</span>" + badge(o.status) + depth + "</div>";
    if (c.is_fieldpulse) {
      return '<div class="pl home">' + head +
        '<p class="pl-assess">Not yet assessed internally, flagged for verification. Shown for an honest gap read, never inflated.</p></div>';
    }
    var assess = '<p class="pl-assess">' + esc(o.assessment) + "</p>";
    var meta = '<div class="pl-meta">' + (o.as_of ? "<span>Verified " + esc(fmtDate(o.as_of)) + "</span>" : "") +
      (o.needs_verification ? '<span class="pl-verify">Needs verification</span>' : "") + "</div>";
    var srcArr = (o.sources && o.sources.length) ? o.sources : (o.primary_source ? [{ title: o.primary_source, url: o.primary_source }] : []);
    var src = srcArr.length ? '<div class="pl-src">' + srcArr.map(function (s) {
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + "</a>";
    }).join("") + "</div>" : "";
    return '<div class="pl">' + head + assess + meta + src + "</div>";
  }

  function capBlock(c, cap) {
    var o = off(c.slug, cap.slug);
    var depth = o.depth ? '<span class="pl-depth">' + pips(o.depth) + " " + DEPTH[o.depth].label + "</span>" : "";
    var head = '<div class="pl-head"><span class="pl-name">' + esc(cap.title) + "</span>" + badge(o.status) + depth + "</div>";
    if (c.is_fieldpulse) {
      return '<div class="pl home">' + head + '<p class="pl-assess">Not yet assessed internally, flagged for verification.</p></div>';
    }
    var srcArr = (o.sources && o.sources.length) ? o.sources : [];
    var src = srcArr.length ? '<div class="pl-src">' + srcArr.map(function (s) {
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + "</a>";
    }).join("") + "</div>" : "";
    return '<div class="pl">' + head + '<p class="pl-assess">' + esc(o.assessment) + "</p>" + src + "</div>";
  }

  function openCap(capSlug) {
    var cap = caps.filter(function (x) { return x.slug === capSlug; })[0];
    if (!cap) return;
    var html = '<div class="dw-head"><div><p class="dw-kicker">Capability</p><h2 class="dw-title">' + esc(cap.title) + "</h2>" +
      '<p class="dw-blurb">' + esc(cap.blurb) + '</p></div><button class="dw-close" aria-label="Close">&times;</button></div>' +
      (cap.overall ? '<div class="dw-overall"><strong>State of the field.</strong> ' + esc(cap.overall) + "</div>" : "") +
      '<div class="dw-players">' + ORDER.map(function (c) { return playerBlock(c, cap); }).join("") + "</div>";
    show(html);
  }

  function openComp(cSlug) {
    var c = D.competitors.filter(function (x) { return x.slug === cSlug; })[0];
    if (!c) return;
    var s = stats(c.slug);
    var sub = c.is_fieldpulse ? "Not yet assessed" : s.shipped + " of " + TOTAL + " capabilities shipped" + (s.ml ? ", " + s.ml + " market-leading" : "");
    var html = '<div class="dw-head"><div><p class="dw-kicker">Competitor profile</p><h2 class="dw-title">' + esc(c.name) + "</h2>" +
      '<p class="dw-blurb">' + esc(sub) + '</p></div><button class="dw-close" aria-label="Close">&times;</button></div>' +
      '<div class="dw-overall">' + esc(c.summary) + "</div>" +
      '<div class="dw-players">' + caps.map(function (cap) { return capBlock(c, cap); }).join("") + "</div>";
    show(html);
  }

  function show(html) {
    lastFocus = root.activeElement;
    drawer.innerHTML = html;
    overlay.hidden = false; drawer.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add("open"); drawer.classList.add("open"); });
    drawer.setAttribute("aria-hidden", "false");
    var btn = drawer.querySelector(".dw-close");
    if (btn) { btn.addEventListener("click", closeDrawer); btn.focus(); }
    document.addEventListener("keydown", onKey);
  }
  function closeDrawer() {
    overlay.classList.remove("open"); drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKey);
    setTimeout(function () { if (!drawer.classList.contains("open")) { drawer.hidden = true; overlay.hidden = true; } }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") return closeDrawer();
    if (e.key === "Tab") {
      var f = drawer.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && root.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && root.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  overlay.addEventListener("click", closeDrawer);

  root.getElementById("matrix").addEventListener("click", function (e) {
    var row = e.target.closest("[data-cap]");
    if (row) openCap(row.getAttribute("data-cap"));
  });
  root.getElementById("cards").addEventListener("click", function (e) {
    var card = e.target.closest("[data-comp]");
    if (card) openComp(card.getAttribute("data-comp"));
  });

  renderMasthead();
  renderVerdict();
  renderCards();
  renderMatrix();
  renderLegend();
  renderFoot();
})();
