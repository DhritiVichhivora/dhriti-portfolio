/* ==========================================================================
   main.js: builds the page from window.SITE (js/data.js) and adds behaviour.
   Everything sits in one IIFE. Each feature is a small named init function,
   wrapped in try/catch, so one failure never breaks the rest of the site.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.SITE || {};
  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;   /* a real mouse */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = { current: 'top', project: null, paused: false, ended: false };
  var visuals = {};                       /* project visuals register start/stop here */
  var TEXT_ARROW = '↗︎';        /* "↗" forced to text, never emoji */

  /* ---------- Small helpers ---------- */
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtTime(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + pad2(s % 60); }
  function run(name, fn) {
    try { fn(); } catch (e) { console.warn('[' + name + '] skipped:', e); }
  }
  function emit(name, detail) { doc.dispatchEvent(new CustomEvent(name, { detail: detail })); }

  /* Toast: one shared status message */
  var toastTimer;
  function toast(msg, ms) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 1600);
  }

  /* Simple line icons (hand-drawn paths, 24x24 grid) */
  var ICONS = {
    chart: '<path d="M4 20V11M10 20V5M16 20v-7M21 20H3"/>',
    spark: '<circle cx="12" cy="12" r="2.6"/><path d="M12 2.5v4.5M12 17v4.5M2.5 12H7M17 12h4.5M5.6 5.6l3 3M15.4 15.4l3 3M5.6 18.4l3-3M15.4 8.6l3-3"/>',
    tools: '<path d="M8 6l-5 6 5 6M16 6l5 6-5 6M13.5 4l-3 16"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.6 14.1c3 .3 5.4 2.7 5.4 5.9"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
    stack: '<path d="M12 3l9 4.8-9 4.8-9-4.8L12 3z"/><path d="M3 12.4l9 4.8 9-4.8M3 16.6l9 4.8 9-4.8"/>',
    speech: '<path d="M4 4.5h16v11H9.5L4 19.5v-15z"/><path d="M8 9h8M8 12h5"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* Wave divider, filled with the NEXT section's colour */
  function wave(next) {
    return '<div class="wave" style="--next:' + next + '" aria-hidden="true">' +
      '<svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0 34C180 6 360 2 560 22s400 38 600 26 220-26 280-30V60H0z"/></svg></div>';
  }

  /* A star shape (used in the badge) */
  function starPath(cx, cy, R, r, n) {
    var d = '';
    for (var i = 0; i < n * 2; i++) {
      var rad = i % 2 ? r : R;
      var a = Math.PI / n * i - Math.PI / 2;
      d += (i ? 'L' : 'M') + (cx + rad * Math.cos(a)).toFixed(2) + ' ' + (cy + rad * Math.sin(a)).toFixed(2);
    }
    return d + 'Z';
  }

  /* Deterministic "random" numbers, so the illustrations look the same every visit */
  function seeded(i) { var x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }

  /* ==========================================================================
     RENDER: turn the data into HTML
     ========================================================================== */

  function renderCover() {
    var p = S.profile;
    if (!p) return '';
    var tag = esc(p.tagline.replace(/\.$/, ''));
    var widths = [3, 1, 2, 1, 4, 1, 2, 3, 1, 2];
    var barcode = widths.map(function (w) { return '<i style="width:' + w + 'px"></i>'; }).join('');
    var lines = (p.coverLines || []).map(esc).join('<br>');
    var badge =
      '<div class="badge stk" data-depth="18" aria-hidden="true"><svg viewBox="0 0 120 120">' +
      '<circle class="badge-disc" cx="60" cy="60" r="58"/>' +
      '<g class="badge-rot amb"><path id="badge-path" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" fill="none"/>' +
      '<text class="badge-txt"><textPath href="#badge-path" textLength="268" lengthAdjust="spacing">' + esc(p.badge) + '</textPath></text></g>' +
      '<path class="badge-star" d="' + starPath(60, 60, 17, 7, 5) + '"/></svg></div>';

    return '<div class="cover-wrap" id="cover-wrap">' +
      '<section class="sec s-cover" id="top" data-track="top" aria-label="Cover">' +
      '<div class="sec-bg"></div>' +
      '<div class="glow amb" id="glow" aria-hidden="true"></div>' + badge +
      '<div class="wrap cover-in">' +
        '<p class="cover-issue">' + esc(p.issue) + '</p>' +
        '<div class="cover-main">' +
          '<h1 class="cover-name" id="cover-name" aria-label="' + esc(p.name) + '">' +
            '<span class="nm-line nm-1" data-split="cover">' + esc(p.first) + '</span>' +
            '<span class="nm-line nm-2" data-split="cover">' + esc(p.last) + '</span>' +
          '</h1>' +
          '<span class="stk stk-ds" data-depth="28" aria-hidden="true"><span class="pill-stk">' + esc(p.sticker) + '</span></span>' +
        '</div>' +
        '<p class="stk cover-tag" data-depth="12"><span class="pill-stk">' + tag + '<span class="hot">.</span></span></p>' +
        '<div class="cover-foot"><p class="cover-lines">' + lines + '</p>' +
          '<span class="barcode" aria-hidden="true">' + barcode + '</span></div>' +
      '</div>' +
      '<a class="scroll-cue" href="#about"><span class="label">Scroll</span>' +
        '<svg class="amb" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5"/></svg></a>' +
      wave('var(--ivory)') +
      '</section></div>';
  }

  function renderBand() {
    if (!S.band) return '';
    return '<div class="band" id="band" aria-hidden="true"><div class="band-track" id="band-track">' +
      '<p class="band-text">' + esc(S.band) + '</p><p class="band-text">' + esc(S.band) + '</p>' +
      '<p class="band-text">' + esc(S.band) + '</p></div></div>';
  }

  function head(label, headline, id, extra) {
    return '<header class="sec-head"><p class="label" data-reveal>' + esc(label) + '</p>' +
      '<h2 class="display" id="' + id + '" data-split' + (extra || '') + '>' + esc(headline) + '</h2></header>';
  }

  function renderAbout() {
    var a = S.about;
    if (!a) return '';
    var p = S.profile;
    var paras = a.paragraphs.map(function (t, i) {
      return '<p' + (i === 0 ? ' class="lead"' : '') + ' data-reveal data-delay="' + (i * 100) + '">' + esc(t) + '</p>';
    }).join('');
    var rows = a.facts.map(function (f) {
      return '<tr><th scope="row">' + esc(f[0]) + '</th><td>' + esc(f[1]) + '</td></tr>';
    }).join('');
    var chips = a.interests.map(function (t) { return '<li class="chip">' + esc(t) + '</li>'; }).join('');

    return '<section class="sec s-about" id="about" data-track="about" aria-labelledby="about-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      head(a.label, a.headline, 'about-h', ' data-squiggle="' + esc(a.squiggle) + '"') +
      '<div class="about-grid">' +
        '<div class="about-copy">' + paras +
          '<div class="about-sub" data-reveal>' +
            '<table class="facts"><caption class="sr-only">Quick facts about Dhriti</caption>' +
            '<thead><tr><th scope="col">' + esc(a.factsHead[0]) + '</th><th scope="col">' + esc(a.factsHead[1]) + '</th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table>' +
            '<p class="facts-note">' + a.facts.length + ' ' + esc(a.factsNote) + '</p>' +
          '</div>' +
          '<div class="about-sub" data-reveal><p class="label">' + esc(a.interestsLabel) + '</p><ul class="chips">' + chips + '</ul></div>' +
        '</div>' +
        '<div class="about-photo" data-reveal data-delay="150">' +
          '<div class="stack" data-tilt="8"><div class="stack-in"><div class="stack-float amb">' +
            '<div class="card-back card-burg" aria-hidden="true"><span class="pill-stk">' + esc(a.stickers[1]) + '</span></div>' +
            '<div class="card-back card-rose" aria-hidden="true"><span class="pill-stk">' + esc(a.stickers[0]) + '</span></div>' +
            '<figure class="polaroid"><span class="tape" aria-hidden="true"></span>' +
              '<div class="ph"><img src="' + esc(p.photo) + '" alt="' + esc(p.photoAlt) + '" width="800" height="1000" loading="lazy" decoding="async">' +
              '<span class="ph-fallback" aria-hidden="true">' + esc(p.monogram) + '</span></div>' +
              '<figcaption>' + esc(a.caption) + '</figcaption></figure>' +
          '</div></div></div>' +
        '</div>' +
      '</div></div></section>';
  }

  /* --- Project visuals (illustrations, made-up shapes) --- */
  function vizBars() {
    var h = [42, 55, 48, 66, 74, 60, 82, 92, 76, 63, 52, 45];
    return '<div class="viz" data-viz="bars"><span class="viz-tag">illustration</span><div class="bars">' +
      h.map(function (v, i) {
        var mix = Math.round(clamp((v - 40) / 52, 0, 1) * 100);
        return '<span class="bar" data-tip="Day ' + (i + 1) + ', illustrative" style="--h:' + v + '%;--i:' + i + ';--mix:' + mix + '%">' +
          '<span class="bar-g"><span class="bar-b"></span></span></span>';
      }).join('') + '</div></div>';
  }

  var LINE = { w: 400, h: 230, x0: 34, x1: 388, y0: 18, y1: 188, min: 2, max: 7.5,
    data: [3.2, 3.5, 3.9, 4.4, 4.1, 4.8, 5.6, 6.1, 5.7, 5.2, 4.6, 4.9, 5.4, 6.3, 6.9, 6.4, 5.8, 5.1, 4.7, 4.3, 4.9, 5.5, 5.2, 4.8],
    target: 4 };
  function lineX(i) { return LINE.x0 + (LINE.x1 - LINE.x0) * i / (LINE.data.length - 1); }
  function lineY(v) { return LINE.y1 - (LINE.y1 - LINE.y0) * (v - LINE.min) / (LINE.max - LINE.min); }
  function vizLine() {
    var pts = LINE.data.map(function (v, i) { return [lineX(i), lineY(v)]; });
    /* Smooth curve through the points (Catmull-Rom turned into Bezier curves) */
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' +
        p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    var area = d + 'L' + LINE.x1 + ' ' + LINE.y1 + 'L' + LINE.x0 + ' ' + LINE.y1 + 'Z';
    var grid = '';
    for (var g = 0; g < 4; g++) {
      var gy = LINE.y0 + (LINE.y1 - LINE.y0) * g / 3;
      grid += '<line class="lv-grid" x1="' + LINE.x0 + '" x2="' + LINE.x1 + '" y1="' + gy + '" y2="' + gy + '"/>';
    }
    var ticks = [6, 12, 18, 24].map(function (m) {
      var x = lineX(m - 1);
      return '<line class="lv-grid" x1="' + x + '" x2="' + x + '" y1="' + LINE.y1 + '" y2="' + (LINE.y1 + 5) + '"/>' +
        '<text class="lv-txt" x="' + x + '" y="' + (LINE.y1 + 18) + '" text-anchor="middle">M' + m + '</text>';
    }).join('');
    var ty = lineY(LINE.target);
    return '<div class="viz line-viz" data-viz="line"><span class="viz-tag">illustration</span>' +
      '<svg viewBox="0 0 ' + LINE.w + ' ' + LINE.h + '" role="img" aria-label="Illustrative line chart, not real data">' +
      grid + ticks +
      '<path class="lv-area" d="' + area + '"/>' +
      '<line class="lv-target" x1="' + LINE.x0 + '" x2="' + LINE.x1 + '" y1="' + ty + '" y2="' + ty + '"/>' +
      '<text class="lv-txt" x="' + LINE.x0 + '" y="' + (ty - 6) + '">target band, illustrative</text>' +
      '<path class="lv-line" d="' + d + '"/>' +
      '<line class="lv-guide" x1="0" x2="0" y1="' + LINE.y0 + '" y2="' + LINE.y1 + '"/>' +
      '<circle class="lv-dot" r="5" cx="' + LINE.x0 + '" cy="' + pts[0][1] + '"/>' +
      '<g class="lv-tip"><rect width="128" height="22" rx="6"/><text x="10" y="15"></text></g>' +
      '<rect class="lv-hit" x="0" y="0" width="' + LINE.w + '" height="' + LINE.h + '" fill="transparent"/>' +
      '</svg></div>';
  }

  function vizEq(chips) {
    var bars = '';
    for (var i = 0; i < 24; i++) {
      var c = i < 12
        ? 'color-mix(in srgb, var(--rose) ' + Math.round(35 + i / 11 * 65) + '%, var(--burgundy))'
        : 'color-mix(in srgb, var(--hot) ' + Math.round((i - 12) / 11 * 100) + '%, var(--rose))';
      var du = (0.7 + seeded(i) * 0.7).toFixed(2);
      var de = (-seeded(i + 40) * 1.4).toFixed(2);
      bars += '<i style="--c:' + c + ';--du:' + du + 's;--de:' + de + 's"></i>';
    }
    var chipHtml = (chips || []).map(function (c) { return '<span class="tag eq-chip">' + esc(c) + '</span>'; }).join('');
    return '<div class="viz" data-viz="eq"><span class="viz-tag">illustration</span>' +
      '<div class="eqv amb" aria-hidden="true">' + bars + '</div>' +
      '<div class="eq-row"><button class="eq-play" type="button" aria-label="Play equaliser" aria-pressed="true">' +
        '<svg class="i-pause" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>' +
        '<svg class="i-play" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '</button>' + chipHtml + '</div></div>';
  }

  function vizTerminal() {
    var t = S.work.terminal;
    return '<div class="viz" data-viz="terminal"><span class="viz-tag">illustration, made-up data</span>' +
      '<div class="term"><div class="term-bar" aria-hidden="true"><i></i><i></i><i></i><span>' + esc(t.title) + '</span></div>' +
      '<div class="term-body" aria-hidden="true"></div></div></div>';
  }

  function renderWork() {
    var w = S.work;
    if (!w) return '';
    var L = w.blockLabels;
    var rows = w.projects.map(function (p, i) {
      var n = pad2(i + 1);
      var tools = p.tools.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
      var viz = p.visual === 'bars' ? vizBars() : p.visual === 'line' ? vizLine() : p.visual === 'eq' ? vizEq(p.chips) : vizTerminal();
      var blocks = '<dt>' + esc(L.what) + '</dt><dd>' + esc(p.what) + '</dd>';
      if (p.did) blocks += '<dt>' + esc(L.did) + '</dt><dd>' + esc(p.did) + '</dd>';
      if (p.learned) blocks += '<dt>' + esc(L.learned) + '</dt><dd>' + esc(p.learned) + '</dd>';
      if (tools) blocks += '<dt>' + esc(L.tools) + '</dt><dd><span class="trk-tools">' + tools + '</span></dd>';
      var links = p.code
        ? '<a class="btn btn-sm btn-solid" href="' + esc(p.code) + '" target="_blank" rel="noopener noreferrer">' + esc(w.codeLabel) +
          ' <span class="arr" aria-hidden="true">' + TEXT_ARROW + '</span><span class="sr-only"> (opens in a new tab)</span></a>'
        : '<span class="tag soon">' + esc(w.soonLabel) + '</span>';
      if (p.demo) {
        links += '<a class="btn btn-sm" href="' + esc(p.demo) + '" target="_blank" rel="noopener noreferrer">' + esc(w.demoLabel) +
          ' <span class="arr" aria-hidden="true">' + TEXT_ARROW + '</span><span class="sr-only"> (opens in a new tab)</span></a>';
        if (p.demoNote) links += '<p class="demo-note">Live demo: ' + esc(p.demoNote) + '.</p>';
      }
      return '<li class="trk" data-id="' + esc(p.id) + '" data-reveal data-delay="' + (i * 80) + '">' +
        '<button class="trk-head" type="button" id="h-' + esc(p.id) + '" aria-expanded="false" aria-controls="p-' + esc(p.id) + '" data-cursor="OPEN">' +
          '<span class="trk-num"><span class="trk-n">' + n + '</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></span>' +
          '<span class="trk-title">' + esc(p.title) + '</span>' +
          '<span class="trk-sum">' + esc(p.summary) + '</span>' +
          '<span class="trk-tools">' + p.tools.slice(0, 3).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</span>' +
          '<span class="trk-arr" aria-hidden="true">' + TEXT_ARROW + '</span>' +
        '</button>' +
        '<div class="trk-panel" id="p-' + esc(p.id) + '" role="region" aria-labelledby="h-' + esc(p.id) + '"><div class="trk-clip"><div class="trk-body">' +
          viz + '<div class="case"><dl>' + blocks + '</dl><div class="case-links">' + links + '</div></div>' +
        '</div></div></div></li>';
    }).join('');

    return '<section class="sec s-work" id="work" data-track="work" aria-labelledby="work-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      '<header class="sec-head"><p class="label" data-reveal>' + esc(w.label) + '</p>' +
        '<h2 class="display" id="work-h" data-split>' + esc(w.headline) + '</h2>' +
        '<p class="work-sub" data-reveal>' + esc(w.subhead) + '</p></header>' +
      '<div class="work-intro" data-reveal><p>' + esc(w.intro) + '</p><p class="muted">' + esc(w.note) + '</p></div>' +
      '<ol class="tracks">' + rows + '</ol>' +
      '</div>' + wave('var(--rose)') + '</section>';
  }

  function renderSkills() {
    var k = S.skills;
    if (!k) return '';
    var cards = k.groups.map(function (g, i) {
      var pills = g.items.map(function (t) { return '<li class="pill" data-magnet="6">' + esc(t) + '</li>'; }).join('');
      return '<article class="skill-card" data-reveal data-delay="' + (i * 90) + '" data-tilt="6">' +
        '<div class="sk-top"><span class="sk-num">' + pad2(i + 1) + '</span>' + icon(g.icon, 'sk-icon') + '</div>' +
        '<h3>' + esc(g.title) + '</h3><ul class="pills">' + pills + '</ul></article>';
    }).join('');
    var words = k.exploring.map(function (w, i) { return '<span' + (i === 0 ? ' class="on"' : '') + '>' + esc(w) + '</span>'; }).join('');
    var list = k.exploring.map(esc).join(', ');
    return '<section class="sec s-skills" id="skills" data-track="skills" aria-labelledby="skills-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      head(k.label, k.headline, 'skills-h') +
      '<div class="skill-grid">' + cards + '</div>' +
      '<p class="explore" data-reveal><span class="explore-lead">' + esc(k.exploringLead) + ' → </span>' +
        '<span class="flipword" id="flipword" aria-hidden="true" aria-live="off">' + words + '</span>' +
        '<span class="explore-static" aria-hidden="true">' + list + '</span>' +
        '<span class="sr-only">' + list + '</span></p>' +
      '</div>' + wave('var(--ivory)') + '</section>';
  }

  function renderBeyond() {
    var b = S.beyond;
    if (!b) return '';
    var cards = b.cards.map(function (c, i) {
      var back = c.timeline
        ? '<span class="tl">' + c.timeline.map(function (r) {
            return '<span class="tl-row"><span class="tl-y">' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></span>';
          }).join('') + '</span>'
        : '<span class="f-line">' + esc(c.line) + '</span><span class="f-detail">' + esc(c.detail) + '</span>';
      var frontLine = c.timeline ? '<span class="f-line">' + esc(c.line) + '</span>' : '';
      return '<li class="flip-wrap" data-reveal data-delay="' + (i * 90) + '">' +
        '<button class="flip flip-' + esc(c.id) + '" type="button" aria-pressed="false" data-cursor="FLIP">' +
          '<span class="flip-in">' +
            '<span class="face front">' + icon(c.icon, 'f-icon') +
              '<span><span class="f-title">' + esc(c.title) + '</span>' + frontLine +
              '<span class="f-turn" aria-hidden="true">Flip ↻</span></span></span>' +
            '<span class="face back" aria-hidden="true">' + back + '</span>' +
          '</span></button>' +
        (c.sticker ? '<span class="hallo" aria-hidden="true">' + esc(c.sticker) + '</span>' : '') +
        '</li>';
    }).join('');
    return '<section class="sec s-beyond" id="beyond" data-track="beyond" aria-labelledby="beyond-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      head(b.label, b.headline, 'beyond-h') +
      '<p class="beyond-hint" data-reveal>' + esc(b.hint) + '</p>' +
      '<ul class="flips">' + cards + '</ul>' +
      '</div>' + wave('var(--burgundy)') + '</section>';
  }

  function renderContact() {
    var c = S.contact;
    if (!c) return '';
    var links = c.links.map(function (l) {
      var ext = l.href.indexOf('mailto:') !== 0;
      return '<li><a class="btn" data-magnet="8" href="' + esc(l.href) + '"' +
        (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(l.label) +
        ' <span class="arr" aria-hidden="true">' + TEXT_ARROW + '</span>' +
        (ext ? '<span class="sr-only"> (opens in a new tab)</span>' : '') + '</a></li>';
    }).join('');
    return '<section class="sec s-contact" id="contact" data-track="contact" aria-labelledby="contact-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      '<header class="sec-head"><p class="label" data-reveal>' + esc(c.label) + '</p>' +
        '<h2 class="say" id="contact-h" data-split data-hotdot>' + esc(c.headline) + '</h2></header>' +
      '<p class="contact-line" data-reveal>' + esc(c.line) + '</p>' +
      '<ul class="c-links" data-reveal>' + links + '</ul>' +
      '<div class="email-row" data-reveal><span class="email-txt">' + esc(c.email) + '</span>' +
        '<button class="btn btn-sm" id="copy-btn" type="button" data-magnet="6">' + esc(c.copyLabel) + ' email</button></div>' +
      '<button class="btn btn-sm replay-btn" id="replay-btn" type="button">' + esc(c.replay) + ' <span class="arr" aria-hidden="true">↑</span></button>' +
      '</div>' + wave('var(--burgundy-deep)') + '</section>';
  }

  /* Build every section, then swap out the plain fallback */
  function initRender() {
    var html = renderCover() + renderBand() + renderAbout() + renderWork() + renderSkills() + renderBeyond() + renderContact();
    if (!html) throw new Error('No content in js/data.js');
    var main = $('#main');
    var fb = $('#fallback');
    if (fb) fb.parentNode.removeChild(fb);
    main.insertAdjacentHTML('beforeend', html);
    if (S.footer) $('#footer').innerHTML = '<p>' + esc(S.footer) + '</p>';

    /* Nav links (desktop) and menu links (mobile) */
    var present = (S.nav || []).filter(function (n) { return doc.getElementById(n.id); });
    $('#nav-links').innerHTML = present.map(function (n) {
      return '<li><a href="#' + n.id + '" data-nav="' + n.id + '">' + esc(n.label) + '</a></li>';
    }).join('');
    $('#menu-links').innerHTML = present.map(function (n, i) {
      return '<li style="--i:' + i + '"><a href="#' + n.id + '"><small>' + pad2(i + 1) + '</small>' + esc(n.label) + '</a></li>';
    }).join('');

    /* Player text from data */
    if (S.profile) $('#pl-list').textContent = S.profile.playlist;
    if (S.tracks) $('#pl-total').textContent = fmtTime(S.tracks.length);

    /* Image fallbacks: DV monogram if a photo fails to load */
    var art = $('.pl-art'), small = $('#pl-img');
    if (small) {
      if (S.profile && S.profile.photoSmall) small.src = S.profile.photoSmall;
      small.addEventListener('error', function () { art.classList.add('no-img'); });
      if (small.complete && !small.naturalWidth) art.classList.add('no-img');
    }
    $$('.polaroid img').forEach(function (img) {
      img.addEventListener('error', function () { img.parentNode.classList.add('failed'); });
      if (img.complete && !img.naturalWidth && img.src) img.parentNode.classList.add('failed');
    });
  }

  /* ==========================================================================
     LETTERS THAT WIGGLE
     ========================================================================== */
  var SQUIGGLE = '<svg class="squig" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">' +
    '<path pathLength="300" d="M3 13C24 4 40 17 62 10S98 3 120 11s38 6 54-1 20-3 23-2"/></svg>';

  function initSplitLetters() {
    var coverIndex = 0;
    $$('[data-split]').forEach(function (el) {
      var isCover = el.getAttribute('data-split') === 'cover';
      var text = el.textContent;
      var sq = el.getAttribute('data-squiggle');
      var hotDot = el.hasAttribute('data-hotdot');
      if (!isCover) el.setAttribute('aria-label', text);
      el.innerHTML = text.split(' ').map(function (word) {
        var chars = Array.from(word).map(function (c) {
          var cls = 'ch' + (hotDot && c === '.' ? ' hot' : '');
          if (isCover) {
            var i = coverIndex++;
            return '<span class="' + cls + '" aria-hidden="true"><span class="ch-f" style="--d:' + (i * 60) + 'ms;--fd:' + (i * 120) + 'ms">' +
              '<span class="ch-i">' + esc(c) + '</span></span></span>';
          }
          return '<span class="' + cls + '" aria-hidden="true">' + esc(c) + '</span>';
        }).join('');
        var isSq = sq && word.replace(/[^A-Za-z]/g, '') === sq;
        return '<span class="w' + (isSq ? ' squig-word' : '') + '">' + chars + (isSq ? SQUIGGLE : '') + '</span>';
      }).join(' ');
    });

    /* Index the letters of each heading so neighbours can echo the wiggle */
    var heads = $$('.cover-name, h2[data-split]');
    heads.forEach(function (h) {
      var list = $$('.ch', h);
      list.forEach(function (ch, i) { ch._list = list; ch._i = i; });
    });

    if (reduce) return;   /* reduced motion: colour change on hover only */

    function busy(ch) { return ch.classList.contains('wig') || ch.classList.contains('wig1') || ch.classList.contains('wig2'); }
    function wiggle(ch) {
      if (!ch || busy(ch)) return;
      ch.classList.add('wig');
      var l = ch._list || [], i = ch._i;
      [[i - 1, 'wig1'], [i + 1, 'wig1'], [i - 2, 'wig2'], [i + 2, 'wig2']].forEach(function (n) {
        var nb = l[n[0]];
        if (nb && !busy(nb)) nb.classList.add(n[1]);
      });
    }
    doc.addEventListener('animationend', function (e) {
      if (e.animationName === 'wiggle') {
        e.target.classList.remove('wig', 'wig1', 'wig2');
        e.target.style.animationDelay = '';
      }
    });
    if (fine) {
      doc.addEventListener('mouseover', function (e) {
        var ch = e.target.closest && e.target.closest('.ch');
        if (ch) wiggle(ch);
      });
    } else {
      /* Touch: tap a letter, and each heading waves once when it first appears */
      doc.addEventListener('pointerdown', function (e) {
        var ch = e.target.closest && e.target.closest('.ch');
        if (ch) wiggle(ch);
      });
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            io.unobserve(en.target);
            $$('.ch', en.target).forEach(function (ch, i) {
              ch.style.animationDelay = (i * 40) + 'ms';
              ch.classList.add('wig');
            });
          });
        }, { threshold: 0.6 });
        $$('h2[data-split]').forEach(function (h) { io.observe(h); });
      }
    }
  }

  /* ==========================================================================
     CURTAIN and the cover name entrance
     ========================================================================== */
  function startName() {
    var nm = $('#cover-name');
    if (!nm) return;
    if (reduce) { nm.classList.add('done'); return; }
    nm.classList.add('go');
    var total = $$('.ch', nm).length * 60 + 950;
    setTimeout(function () {
      nm.classList.add('done');
      $$('.ch-f', nm).forEach(function (f) { f.classList.add('amb'); });
    }, total);
  }

  function initCurtain() {
    var c = $('#curtain');
    if (!c || reduce) {
      if (c) c.parentNode.removeChild(c);
      startName();
      return;
    }
    setTimeout(function () {
      c.classList.add('up');
      startName();
      setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 950);
    }, 700);
  }

  /* ==========================================================================
     PLAYER BAR: sections are tracks, scroll is playback
     ========================================================================== */
  function initPlayer() {
    var T = S.tracks || {};
    var ids = ['top', 'about', 'work', 'skills', 'beyond', 'contact'];
    var secs = ids.map(function (id) { return doc.getElementById(id); }).filter(Boolean);
    var titleBox = $('#pl-title'), fill = $('#pl-fill'), now = $('#pl-now'), track = $('#pl-track');
    var next = $('#pl-next'), prev = $('#pl-prev'), play = $('#pl-play');
    var len = T.length || 150;
    var shown = (T.top || 'Cover');
    var ticking = false;

    function setTitle(t) {
      if (t === shown) return;
      shown = t;
      var old = $$('.pl-t', titleBox);
      var span = doc.createElement('span');
      span.className = 'pl-t in';
      span.textContent = t;
      titleBox.appendChild(span);
      span.getBoundingClientRect();          /* commit the start position */
      span.classList.remove('in');
      old.forEach(function (o) {
        o.classList.add('out');
        setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 260);
      });
    }

    function currentId() {
      var line = window.innerHeight * 0.4, cur = secs[0];
      secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s; });
      return cur ? cur.id : 'top';
    }

    function update() {
      ticking = false;
      var max = root.scrollHeight - window.innerHeight;
      var y = window.scrollY || window.pageYOffset;
      var p = max > 0 ? clamp(y / max, 0, 1) : 0;
      var id = currentId();
      var contact = doc.getElementById('contact');
      var ended = (max > 0 && y >= max - 4) ||
        (id === 'contact' && contact && contact.getBoundingClientRect().top <= window.innerHeight * 0.15);
      if (ended) p = 1;
      state.ended = ended;

      fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      now.textContent = fmtTime(p * len);
      track.setAttribute('aria-valuenow', Math.round(p * 100));
      track.setAttribute('aria-valuetext', fmtTime(p * len) + ' of ' + fmtTime(len));

      var title = T[id] || id;
      if (id === 'work' && state.project) title = state.project;
      if (ended) title = T.ended || 'Track ended';
      setTitle(title);

      next.classList.toggle('replay', ended);
      next.setAttribute('aria-label', ended ? 'Replay from the top' : 'Next section');

      if (id !== state.current) { state.current = id; emit('dv:section', id); }
    }
    function request() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    doc.addEventListener('dv:refresh', request);
    update();

    /* Seek: click, drag or use the keyboard on the progress bar */
    function scrollToPct(p, instant) {
      var max = root.scrollHeight - window.innerHeight;
      window.scrollTo({ top: clamp(p, 0, 1) * max, behavior: instant ? 'instant' : 'smooth' });
    }
    var dragging = false;
    function seek(e, instant) {
      var r = track.getBoundingClientRect();
      scrollToPct((e.clientX - r.left) / r.width, instant);
    }
    track.addEventListener('pointerdown', function (e) {
      dragging = true;
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
      seek(e, false);
    });
    track.addEventListener('pointermove', function (e) { if (dragging) seek(e, true); });
    track.addEventListener('pointerup', function () { dragging = false; });
    track.addEventListener('pointercancel', function () { dragging = false; });
    track.addEventListener('keydown', function (e) {
      var max = root.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) : 0;
      var step = { ArrowRight: .05, ArrowUp: .05, ArrowLeft: -.05, ArrowDown: -.05, PageUp: .1, PageDown: -.1 }[e.key];
      if (e.key === 'Home') { scrollToPct(0); e.preventDefault(); }
      else if (e.key === 'End') { scrollToPct(1); e.preventDefault(); }
      else if (step) { scrollToPct(p + step); e.preventDefault(); }
    });

    /* Previous / next section, or replay at the end */
    function go(dir) {
      var i = secs.findIndex(function (s) { return s.id === state.current; });
      var target = secs[clamp(i + dir, 0, secs.length - 1)];
      if (!target) return;
      if (target.id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth' });
    }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () {
      if (state.ended) window.scrollTo({ top: 0, behavior: 'smooth' });
      else go(1);
    });

    /* Play / pause all ambient animation */
    play.addEventListener('click', function () {
      state.paused = !state.paused;
      body.classList.toggle('paused', state.paused);
      play.setAttribute('aria-pressed', String(!state.paused));
      emit('dv:pause', state.paused);
    });
  }

  /* ==========================================================================
     NAVIGATION: scrolled style, active link, mobile menu
     ========================================================================== */
  function initNav() {
    var nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
    function onScroll() { nav.classList.toggle('scrolled', (window.scrollY || 0) > 80); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    doc.addEventListener('dv:section', function (e) {
      $$('#nav-links a').forEach(function (a) {
        var on = a.getAttribute('data-nav') === e.detail;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    });

    function setOpen(open, returnFocus) {
      menu.classList.toggle('open', open);
      nav.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
      body.style.overflow = open ? 'hidden' : '';
      if (open) { var first = $('a', menu); if (first) setTimeout(function () { first.focus(); }, 60); }
      else if (returnFocus) burger.focus();
    }
    burger.addEventListener('click', function () { setOpen(!menu.classList.contains('open'), true); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false, false); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) setOpen(false, true);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900 && menu.classList.contains('open')) setOpen(false, false);
    });
  }

  /* ==========================================================================
     COLOUR MOODS
     ========================================================================== */
  function initMood() {
    var moods = S.moods || [{ id: 'burgundy', name: 'Burgundy' }];
    var btn = $('#mood-btn'), meta = $('meta[name="theme-color"]');
    function syncMeta() {
      var c = getComputedStyle(root).getPropertyValue('--burgundy').trim();
      if (meta && c) meta.setAttribute('content', c);
    }
    syncMeta();
    var animTimer;
    btn.addEventListener('click', function () {
      var cur = root.getAttribute('data-mood') || moods[0].id;
      var i = moods.findIndex(function (m) { return m.id === cur; });
      var next = moods[(i + 1) % moods.length];
      root.classList.add('mood-anim');
      root.setAttribute('data-mood', next.id);
      clearTimeout(animTimer);
      animTimer = setTimeout(function () { root.classList.remove('mood-anim'); }, 600);
      try { localStorage.setItem('dv-mood', next.id); } catch (e) { /* storage blocked: still works */ }
      syncMeta();
      toast('Mood: ' + next.name, 1600);
    });
  }

  /* ==========================================================================
     CUSTOM CURSOR (mouse only)
     ========================================================================== */
  function initCursor() {
    if (!fine || reduce) return;
    var dot = $('#cur-dot'), ring = $('#cur-ring'), label = $('#cur-label');
    var x = -100, y = -100, rx = -100, ry = -100, running = false;
    root.classList.add('has-cursor');
    function loop() {
      rx = lerp(rx, x, 0.18); ry = lerp(ry, y, 0.18);
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      if (Math.abs(rx - x) + Math.abs(ry - y) > 0.3) requestAnimationFrame(loop); else running = false;
    }
    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      root.classList.remove('cur-hidden');
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    doc.addEventListener('mouseover', function (e) {
      var t = e.target;
      var hot = t.closest && t.closest('a,button,[role="slider"],.chip,.pill,label');
      var tagged = t.closest && t.closest('[data-cursor]');
      ring.classList.toggle('big', !!hot);
      label.textContent = tagged ? tagged.getAttribute('data-cursor') : '';
    });
    doc.documentElement.addEventListener('mouseleave', function () { root.classList.add('cur-hidden'); });
  }

  /* ==========================================================================
     SCROLL REVEAL
     ========================================================================== */
  function initReveal() {
    var items = $$('[data-reveal]');
    var squigs = $$('.squig');
    if (!('IntersectionObserver' in window) || reduce) {
      squigs.forEach(function (s) { s.classList.add('drawn'); });
      if (!reduce) return;
    }
    root.classList.add('reveal-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.style.setProperty('--rd', (parseInt(el.getAttribute('data-delay'), 10) || 0) + 'ms');
        el.classList.add(el.classList.contains('squig') ? 'drawn' : 'in');
        io.unobserve(el);
      });
    }, { threshold: 0.15 });
    items.concat(squigs).forEach(function (el) { io.observe(el); });
  }

  /* ==========================================================================
     TILT and MAGNETIC hover (mouse only)
     ========================================================================== */
  function initTilt() {
    if (!fine || reduce) return;
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      var target = $('.stack-in', el) || el;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        target.style.transform = 'perspective(900px) rotateX(' + (-ny * max * 2).toFixed(2) + 'deg) rotateY(' + (nx * max * 2).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { target.style.transform = ''; });
    });
  }

  function initMagnet() {
    if (!fine || reduce) return;
    $$('[data-magnet]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-magnet')) || 6;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--mx', (nx * max * 2).toFixed(1) + 'px');
        el.style.setProperty('--my', (ny * max * 2).toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.removeProperty('--mx'); el.style.removeProperty('--my');
      });
    });
  }

  /* ==========================================================================
     WORK: accordion tracklist
     ========================================================================== */
  function initProjects() {
    var rows = $$('.trk');
    var titles = {};
    (S.work ? S.work.projects : []).forEach(function (p) { titles[p.id] = p.title; });

    function setRow(li, open) {
      var btn = $('.trk-head', li), viz = $('.viz', li);
      li.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      var v = viz && visuals[viz.getAttribute('data-viz')];
      if (v) { if (open) v.start(viz); else v.stop(viz); }
    }
    rows.forEach(function (li) {
      $('.trk-head', li).addEventListener('click', function () {
        var open = !li.classList.contains('open');
        rows.forEach(function (o) { if (o !== li && o.classList.contains('open')) setRow(o, false); });
        setRow(li, open);
        state.project = open ? titles[li.getAttribute('data-id')] : null;
        emit('dv:refresh');
      });
    });
  }

  /* ==========================================================================
     PROJECT VISUALS: bars, line, equaliser (terminal is in initTerminal)
     ========================================================================== */
  function initVisuals() {
    visuals.bars = { start: function () {}, stop: function () {} };   /* pure CSS, driven by .open */

    /* CPI line: draws itself, then a dot travels to the latest point */
    var lineRaf = 0;
    visuals.line = {
      start: function (viz) {
        var path = $('.lv-line', viz), dot = $('.lv-dot', viz);
        var L = path.getTotalLength();
        cancelAnimationFrame(lineRaf);
        viz.classList.remove('drawn');
        path.style.transition = 'none';
        path.style.strokeDasharray = L;
        path.style.strokeDashoffset = reduce ? 0 : L;
        if (reduce) {
          var end = path.getPointAtLength(L);
          dot.setAttribute('cx', end.x); dot.setAttribute('cy', end.y);
          viz.classList.add('drawn');
          return;
        }
        path.getBoundingClientRect();
        path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.2,.9,.1,1)';
        path.style.strokeDashoffset = 0;
        var t0 = performance.now();
        (function step(now) {
          var t = clamp((now - t0) / 1600, 0, 1);
          var e = 1 - Math.pow(1 - t, 4);
          var pt = path.getPointAtLength(L * e);
          dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
          if (t < 1) lineRaf = requestAnimationFrame(step); else viz.classList.add('drawn');
        })(t0);
      },
      stop: function () { cancelAnimationFrame(lineRaf); }
    };
    $$('.line-viz').forEach(function (viz) {
      var svg = $('svg', viz), guide = $('.lv-guide', viz), tip = $('.lv-tip', viz), txt = $('.lv-tip text', viz);
      function show(e) {
        var r = svg.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width * LINE.w;
        var i = clamp(Math.round((x - LINE.x0) / (LINE.x1 - LINE.x0) * (LINE.data.length - 1)), 0, LINE.data.length - 1);
        var gx = lineX(i);
        guide.setAttribute('x1', gx); guide.setAttribute('x2', gx);
        txt.textContent = 'Month ' + (i + 1) + ', illustrative';
        var tx = clamp(gx + 8, 2, LINE.w - 130);
        tip.setAttribute('transform', 'translate(' + tx + ',' + (lineY(LINE.data[i]) - 34 < 2 ? lineY(LINE.data[i]) + 12 : lineY(LINE.data[i]) - 34) + ')');
        viz.classList.add('hovering');
      }
      svg.addEventListener('pointermove', show);
      svg.addEventListener('pointerdown', show);
      svg.addEventListener('pointerleave', function () { viz.classList.remove('hovering'); });
    });

    /* Equaliser: its own play / pause button (the global pause also applies) */
    visuals.eq = { start: function () {}, stop: function () {} };
    $$('.eq-play').forEach(function (b) {
      var bars = $('.eqv', b.closest('.viz'));
      b.addEventListener('click', function () {
        var playing = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(playing));
        bars.classList.toggle('stopped', !playing);
      });
    });
  }

  /* ==========================================================================
     TERMINAL: types a question, then the query, then shows a result table
     ========================================================================== */
  function initTerminal() {
    var T = S.work && S.work.terminal;
    if (!T) return;
    var runId = 0;

    function tableHtml(ex) {
      return '<table class="term-t"><thead><tr>' + ex.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
        '</tr></thead><tbody>' + ex.rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table>';
    }
    function staticState(bodyEl, ex) {
      bodyEl.innerHTML = '<div class="term-q">' + esc(ex.ask) + '</div><div class="term-c">' + esc(ex.query) + '</div>' + tableHtml(ex);
      $('.term-t', bodyEl).classList.add('show');
    }

    visuals.terminal = {
      start: function (viz) {
        var bodyEl = $('.term-body', viz);
        var my = ++runId;
        if (reduce) { staticState(bodyEl, T.examples[0]); return; }

        /* Waits that respect the global pause and stop when the panel closes */
        function sleep(ms) {
          return new Promise(function (res, rej) {
            var left = ms;
            (function tick() {
              if (my !== runId) return rej('stopped');
              if (state.paused) return setTimeout(tick, 200);
              if (left <= 0) return res();
              var s = Math.min(left, 60); left -= s; setTimeout(tick, s);
            })();
          });
        }
        function type(el, text, speed) {
          var caret = doc.createElement('span'); caret.className = 'caret';
          var node = doc.createTextNode('');
          el.appendChild(node); el.appendChild(caret);
          var i = 0;
          function next() {
            if (i >= text.length) { caret.parentNode.removeChild(caret); return Promise.resolve(); }
            node.data += text.charAt(i++);
            return sleep(speed).then(next);
          }
          return next();
        }
        function play(k) {
          var ex = T.examples[k % T.examples.length];
          bodyEl.innerHTML = '<div class="term-q"></div><div class="term-c"></div>';
          var q = $('.term-q', bodyEl), c = $('.term-c', bodyEl);
          return sleep(300)
            .then(function () { return type(q, ex.ask, 45); })
            .then(function () { return sleep(600); })
            .then(function () { return type(c, ex.query, 22); })
            .then(function () { return sleep(300); })
            .then(function () {
              bodyEl.insertAdjacentHTML('beforeend', tableHtml(ex));
              var t = $('.term-t', bodyEl); t.getBoundingClientRect(); t.classList.add('show');
              return sleep(3000);
            })
            .then(function () { return play(k + 1); });
        }
        play(0).catch(function () { /* stopped on purpose */ });
      },
      stop: function () { runId++; }
    };
  }

  /* ==========================================================================
     FLIP CARDS
     ========================================================================== */
  function initFlip() {
    $$('.flip').forEach(function (card) {
      card.addEventListener('click', function () {
        var on = card.getAttribute('aria-pressed') !== 'true';
        card.setAttribute('aria-pressed', String(on));
        $('.front', card).setAttribute('aria-hidden', String(on));
        $('.back', card).setAttribute('aria-hidden', String(!on));
      });
    });
  }

  /* ==========================================================================
     COPY EMAIL and REPLAY
     ========================================================================== */
  function initCopy() {
    var btn = $('#copy-btn');
    var C = S.contact || {};
    if (btn) {
      btn.addEventListener('click', function () {
        function fallback() {
          var ta = doc.createElement('textarea');
          ta.value = C.email; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
          body.appendChild(ta); ta.select();
          var ok = false;
          try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
          body.removeChild(ta);
          toast(ok ? (C.copied || 'Copied') : C.email, 1800);
        }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(C.email).then(function () { toast(C.copied || 'Copied', 1800); }, fallback);
        } else fallback();
      });
    }
    var rp = $('#replay-btn');
    if (rp) rp.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ==========================================================================
     OUTLINED BAND: drifts sideways, faster when you scroll faster
     ========================================================================== */
  function initBand() {
    var band = $('#band'), trackEl = $('#band-track');
    if (!band || reduce) return;
    var x = 0, lastY = window.scrollY, vel = 0, visible = false, raf = 0;
    function frame() {
      raf = 0;
      if (!visible || state.paused) return;
      var y = window.scrollY;
      vel = lerp(vel, Math.abs(y - lastY), 0.2);
      lastY = y;
      var w = trackEl.firstChild.offsetWidth || 1;
      x -= 0.4 + vel * 0.3;
      if (x <= -w) x += w;
      trackEl.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible && !state.paused) raf = requestAnimationFrame(frame); }
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; kick(); }).observe(band);
    doc.addEventListener('dv:pause', kick);
  }

  /* ==========================================================================
     COVER: glow follows the mouse, stickers parallax; pause when off-screen
     ========================================================================== */
  function initCover() {
    var cover = $('#top');
    if (!cover) return;
    var glow = $('#glow');
    var stickers = $$('.stk', cover);

    /* Pause the cover's ambient loops when it is scrolled away */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { cover.classList.toggle('off', !en[0].isIntersecting); }).observe(cover);
    }
    if (reduce) return;
    if (!fine) { glow.classList.add('drift'); return; }

    var tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5, running = false;
    function loop() {
      cx = lerp(cx, tx, 0.08); cy = lerp(cy, ty, 0.08);
      var r = cover.getBoundingClientRect();
      glow.style.transform = 'translate(' + (cx * r.width).toFixed(1) + 'px,' + (cy * r.height).toFixed(1) + 'px)';
      stickers.forEach(function (s) {
        var d = parseFloat(s.getAttribute('data-depth')) || 15;
        s.style.transform = 'translate(' + ((cx - 0.5) * -2 * d).toFixed(1) + 'px,' + ((cy - 0.5) * -2 * d).toFixed(1) + 'px)';
      });
      if (Math.abs(cx - tx) + Math.abs(cy - ty) > 0.001) requestAnimationFrame(loop); else running = false;
    }
    cover.addEventListener('pointermove', function (e) {
      var r = cover.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height;
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
  }

  /* ==========================================================================
     "CURRENTLY EXPLORING": flips to the next word every 2 seconds
     ========================================================================== */
  function initExplore() {
    var box = $('#flipword');
    if (!box || reduce) return;
    var words = $$('span', box), i = 0;
    setInterval(function () {
      if (state.paused || doc.hidden) return;
      var cur = words[i];
      i = (i + 1) % words.length;
      cur.classList.remove('on'); cur.classList.add('gone');
      words[i].classList.remove('gone'); words[i].classList.add('on');
      setTimeout(function () { cur.classList.remove('gone'); }, 650);
    }, 2000);
  }

  /* ---------- Start everything (each part fails on its own, never together) ---------- */
  run('initRender', initRender);
  run('initSplitLetters', initSplitLetters);
  run('initCurtain', initCurtain);
  run('initPlayer', initPlayer);
  run('initNav', initNav);
  run('initMood', initMood);
  run('initCursor', initCursor);
  run('initReveal', initReveal);
  run('initTilt', initTilt);
  run('initMagnet', initMagnet);
  run('initVisuals', initVisuals);
  run('initTerminal', initTerminal);
  run('initProjects', initProjects);
  run('initFlip', initFlip);
  run('initCopy', initCopy);
  run('initBand', initBand);
  run('initCover', initCover);
  run('initExplore', initExplore);
})();
