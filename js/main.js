/* ==========================================================================
   main.js: builds the page from window.SITE (js/data.js) and adds behaviour.
   Everything sits in one IIFE. Each feature is a small named init function,
   wrapped in try/catch, so one failure never breaks the rest of the site.
   The "wow layer" at the end is optional: if anything there fails, or GSAP
   does not load, the page still works.
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
  var ARROW = '↗︎';             /* "↗" forced to text, never emoji */

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
  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

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

  /* Deterministic "random" numbers, so the illustrations look the same every visit */
  function seeded(i) { var x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }

  /* ==========================================================================
     RENDER: turn the data into HTML
     ========================================================================== */

  /* Editorial section header: label and folio on a hairline, then the headline */
  function head(label, headline, id, extra, sub) {
    var p = S.profile || {};
    return '<header class="sec-head"><div class="sec-meta" data-reveal><p class="label">' + esc(label) + '</p>' +
      '<p class="label folio-r" aria-hidden="true">' + esc(p.name) + ' · ' + esc(p.playlist) + '</p></div>' +
      '<h2 class="display" id="' + id + '" data-split' + (extra || '') + '>' + esc(headline) + '</h2>' + (sub || '') + '</header>';
  }

  function renderCover() {
    var p = S.profile;
    if (!p) return '';
    var tag = esc(p.tagline.replace(/\.$/, ''));
    var widths = [3, 1, 2, 1, 4, 1, 2, 3, 1, 2];
    var barcode = widths.map(function (w) { return '<i style="width:' + w + 'px"></i>'; }).join('');
    var folio = (p.folio || []).map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('');

    return '<div class="cover-wrap" id="cover-wrap">' +
      '<section class="sec s-cover" id="top" data-track="top" aria-label="Cover">' +
      '<div class="sec-bg"><canvas class="ink" id="ink" aria-hidden="true"></canvas></div>' +
      '<div class="glow amb" id="glow" aria-hidden="true"></div>' +
      '<div class="wrap cover-in">' +
        '<p class="folio">' + folio + '</p>' +
        '<div class="cover-main">' +
          '<h1 class="cover-name" id="cover-name" aria-label="' + esc(p.name) + '">' +
            '<span class="nm-line nm-1" data-split="cover">' + esc(p.first) + '</span>' +
            '<span class="nm-line nm-2" data-split="cover">' + esc(p.last) + '</span>' +
          '</h1>' +
        '</div>' +
        '<div class="deck">' +
          '<p class="deck-tag">' + tag + '<span class="hot">.</span></p>' +
          '<p class="deck-intro">' + esc(p.intro) + (p.foodLine ? '<span class="deck-food">' + esc(p.foodLine) + '</span>' : '') + '</p>' +
        '</div>' +
        '<div class="cover-base">' +
          '<a class="scroll-cue" href="#about"><span class="label">Scroll</span>' +
            '<svg class="amb" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5"/></svg></a>' +
          '<span class="barcode" aria-hidden="true">' + barcode + '</span>' +
        '</div>' +
      '</div>' +
      '</section></div>';
  }

  function renderAbout() {
    var a = S.about;
    if (!a) return '';
    var p = S.profile;
    var paras = a.paragraphs.map(function (t, i) {
      return '<p data-reveal data-delay="' + (i * 100) + '">' + esc(t) + '</p>';
    }).join('');
    var rows = a.facts.map(function (f) {
      return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>';
    }).join('');
    var highlights = a.highlights.map(function (h, i) {
      return '<li data-reveal data-delay="' + (i * 90) + '"><span class="hl-big">' + esc(h.big) + '</span><span class="hl-text">' + esc(h.text) + '</span></li>';
    }).join('');

    return '<section class="sec s-about" id="about" data-track="about" aria-labelledby="about-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      head(a.label, a.headline, 'about-h', ' data-under="' + esc(a.underline) + '"') +
      '<p class="statement" data-reveal>' + esc(a.statement) + '</p>' +
      '<div class="about-grid">' +
        '<figure class="portrait" data-reveal data-tilt="4">' +
          '<div class="ph-block"><div class="ph"><img src="' + esc(p.photo) + '" alt="' + esc(p.photoAlt) + '" width="800" height="1000" loading="lazy" decoding="async">' +
          '<span class="ph-fallback" aria-hidden="true">' + esc(p.monogram) + '</span></div></div>' +
          '<figcaption><span>Fig. 01</span>' + esc(a.caption) + '</figcaption>' +
        '</figure>' +
        '<div class="about-copy">' + paras +
          '<dl class="spec" data-reveal>' + rows + '</dl>' +
        '</div>' +
      '</div>' +
      '<div class="highlights"><p class="label">' + esc(a.highlightsLabel) + '</p><ul>' + highlights + '</ul></div>' +
      '</div></section>';
  }

  /* --- Project visuals (illustrations, made-up shapes) --- */
  var BARS = [42, 55, 48, 66, 74, 60, 82, 92, 76, 63, 52, 45];
  function vizBars() {
    return '<div class="viz" data-viz="bars"><span class="viz-tag">illustration</span><div class="bars">' +
      BARS.map(function (v, i) {
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
  /* Smooth curve through points (Catmull-Rom turned into Bezier curves) */
  function smoothPath(pts) {
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' +
        p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }
  function vizLine() {
    var pts = LINE.data.map(function (v, i) { return [lineX(i), lineY(v)]; });
    var d = smoothPath(pts);
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
      '<rect x="0" y="0" width="' + LINE.w + '" height="' + LINE.h + '" fill="transparent"/>' +
      '</svg></div>';
  }

  /* Real screenshots of a project: one large view plus page thumbnails */
  function vizGallery(items) {
    var thumbs = items.map(function (g, i) {
      return '<button class="gal-thumb" type="button" aria-pressed="' + (i === 0) + '" data-i="' + i + '">' +
        '<img src="' + esc(g.src) + '" alt="" width="160" height="90" loading="lazy" decoding="async"><span>' + esc(g.label) + '</span></button>';
    }).join('');
    var first = items[0];
    return '<div class="viz gallery" data-viz="gallery"><span class="viz-tag">the real dashboard \u00b7 tap to enlarge</span>' +
      '<button class="gal-main" type="button" aria-label="Enlarge: ' + esc(first.label) + '">' +
        '<img src="' + esc(first.src) + '" alt="' + esc(first.alt) + '" width="1000" height="560" loading="lazy" decoding="async"></button>' +
      '<div class="gal-thumbs" role="group" aria-label="Dashboard pages">' + thumbs + '</div></div>';
  }

  function vizTerminal() {
    var t = S.work.terminal;
    return '<div class="viz" data-viz="terminal"><span class="viz-tag">illustration, made-up data</span>' +
      '<div class="term"><div class="term-bar" aria-hidden="true"><i></i><i></i><i></i><span>' + esc(t.title) + '</span></div>' +
      '<div class="term-body" aria-hidden="true"></div></div></div>';
  }

  /* GitHub and live-app buttons (used on each row and inside the case study) */
  function projectLinks(p, small) {
    var w = S.work, ext = '<span class="sr-only"> (opens in a new tab)</span>';
    var cls = small ? 'btn btn-xs' : 'btn btn-sm';
    var out = '';
    if (p.code) out += '<a class="' + cls + ' btn-solid" href="' + esc(p.code) + '" target="_blank" rel="noopener noreferrer">' + esc(w.codeLabel) +
      ' <span class="arr" aria-hidden="true">' + ARROW + '</span>' + ext + '</a>';
    if (p.demo) out += '<a class="' + cls + '" href="' + esc(p.demo) + '" target="_blank" rel="noopener noreferrer">' + esc(w.demoLabel) +
      ' <span class="arr" aria-hidden="true">' + ARROW + '</span>' + ext + '</a>';
    return out;
  }

  function renderWork() {
    var w = S.work;
    if (!w) return '';
    var L = w.blockLabels;
    var rows = w.projects.map(function (p, i) {
      var viz = p.visual === 'bars' ? vizBars() : p.visual === 'line' ? vizLine() : p.visual === 'gallery' ? vizGallery(p.gallery) : vizTerminal();
      var blocks = '';
      if (p.origin) blocks += '<dt>' + esc(L.origin) + '</dt><dd>' + esc(p.origin) + '</dd>';
      blocks += '<dt>' + esc(L.question) + '</dt><dd>' + esc(p.question) + '</dd>';
      blocks += '<dt>' + esc(L.data) + '</dt><dd>' + esc(p.data) + '</dd>';
      blocks += '<dt>' + esc(L.built) + '</dt><dd><ul class="built">' + p.built.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></dd>';
      blocks += '<dt>' + esc(L.learned) + '</dt><dd>' + esc(p.learned) + '</dd>';
      blocks += '<dt>' + esc(L.tools) + '</dt><dd class="tools-line">' + p.tools.map(esc).join(' / ') + '</dd>';
      var links = projectLinks(p, false);
      var rowLinks = projectLinks(p, true);
      return '<li class="trk" data-id="' + esc(p.id) + '" data-visual="' + esc(p.visual) + '" data-reveal data-delay="' + (i * 80) + '">' +
        '<div class="trk-row">' +
          '<button class="trk-head" type="button" id="h-' + esc(p.id) + '" aria-expanded="false" aria-controls="p-' + esc(p.id) + '">' +
            '<span class="trk-num" aria-hidden="true"><span class="trk-n">' + pad2(i + 1) + '</span><span class="eq"><i></i><i></i><i></i><i></i></span></span>' +
            '<span class="trk-title">' + esc(p.title) + '</span>' +
            '<span class="trk-sum">' + esc(p.summary) + '</span>' +
            '<span class="trk-meta"><span class="trk-status">' + esc(p.status) + '</span>' + p.tools.slice(0, 3).map(esc).join(' / ') + '</span>' +
            '<span class="trk-arr" aria-hidden="true">+</span>' +
          '</button>' +
          (rowLinks ? '<div class="trk-links">' + rowLinks + '</div>' : '') +
        '</div>' +
        '<div class="trk-panel" id="p-' + esc(p.id) + '" role="region" aria-labelledby="h-' + esc(p.id) + '"><div class="trk-clip"><div class="trk-body">' +
          viz + '<div class="case"><dl>' + blocks + '</dl>' +
          (links ? '<div class="case-links">' + links + (p.demoNote ? '<p class="demo-note">Live app: ' + esc(p.demoNote) + '.</p>' : '') + '</div>' : '') +
          '</div>' +
        '</div></div></div></li>';
    }).join('');

    return '<section class="sec s-work" id="work" data-track="work" aria-labelledby="work-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      head(w.label, w.headline, 'work-h', '', '<p class="work-sub" data-reveal>' + esc(w.subhead) + '</p>') +
      '<div class="work-intro" data-reveal><p>' + esc(w.intro) + '</p><p class="muted">' + esc(w.note) + '</p></div>' +
      '<ol class="tracks" id="tracks">' + rows + '</ol>' +
      '</div></section>';
  }

  /* Experience, education and certifications */
  function renderRecord() {
    var r = S.record;
    if (!r) return '';
    function item(e) {
      return '<article class="rec-item" data-reveal><p class="rec-when">' + esc(e.when) + '</p><div>' +
        '<h4 class="rec-role">' + esc(e.role) + '</h4><p class="rec-org">' + esc(e.org) + '</p>' +
        (e.points ? '<ul class="rec-points">' + e.points.map(function (pt) { return '<li>' + esc(pt) + '</li>'; }).join('') + '</ul>' : '') +
        '</div></article>';
    }
    var certs = r.certs.map(function (c) {
      return '<li><a class="cert" href="' + esc(c.href) + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="cert-name">' + esc(c.name) + '</span><span class="cert-by">' + esc(c.by) + ' · ' + esc(r.certLink) + ' ' + ARROW + '</span>' +
        '<span class="sr-only"> (opens in a new tab)</span></a></li>';
    }).join('');
    return '<section class="sec s-record" id="record" data-track="record" aria-labelledby="record-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      head(r.label, r.headline, 'record-h') +
      '<div class="rec-grid">' +
        '<div class="rec-col"><h3 class="rec-h">' + esc(r.experienceLabel) + '</h3>' + r.experience.map(item).join('') + '</div>' +
        '<div class="rec-col"><h3 class="rec-h">' + esc(r.educationLabel) + '</h3>' + r.education.map(item).join('') +
          '<h3 class="rec-h rec-h2">' + esc(r.certsLabel) + '</h3><ul class="certs" data-reveal>' + certs + '</ul></div>' +
      '</div></div></section>';
  }

  /* Skills as a record crate: each group is a sleeve with its record and tracklist */
  function renderSkills() {
    var k = S.skills;
    if (!k) return '';
    var crate = k.sides.map(function (s, i) {
      var tracks = s.tracks.map(function (t, j) {
        return '<li><span class="tk-n">' + pad2(j + 1) + '</span><span class="tk-name">' + esc(t[0]) + '</span><span class="tk-note">' + esc(t[1]) + '</span></li>';
      }).join('');
      var letter = s.side.slice(-1);
      return '<article class="crate-item crate-' + i + '" data-reveal data-delay="' + (i * 90) + '">' +
        '<div class="sleeve-art" aria-hidden="true">' +
          '<span class="disc"><span class="disc-label">' + esc(letter) + '</span></span>' +
          '<span class="sleeve"><span class="sl-side">' + esc(s.side) + '</span><span class="sl-title">' + esc(s.title) + '</span></span>' +
        '</div>' +
        '<div class="crate-tracks"><p class="label">' + esc(s.side) + '</p><h3>' + esc(s.title) + '</h3><ol class="tk-list">' + tracks + '</ol></div>' +
        '</article>';
    }).join('');
    var words = k.exploring.map(function (w, i) { return '<span' + (i === 0 ? ' class="on"' : '') + '>' + esc(w) + '</span>'; }).join('');
    var list = k.exploring.map(esc).join(', ');
    return '<section class="sec s-skills" id="skills" data-track="skills" aria-labelledby="skills-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      head(k.label, k.headline, 'skills-h') +
      '<p class="crate-intro" data-reveal>' + esc(k.intro) + '</p>' +
      '<div class="crate">' + crate + '</div>' +
      '<p class="explore" data-reveal><span class="explore-lead">' + esc(k.exploringLead) + ' → </span>' +
        '<span class="flipword" id="flipword" aria-hidden="true" aria-live="off">' + words + '</span>' +
        '<span class="explore-static" aria-hidden="true">' + list + '</span>' +
        '<span class="sr-only">' + list + '</span></p>' +
      '</div></section>';
  }

  function renderBeyond() {
    var b = S.beyond;
    if (!b) return '';
    var cards = b.cards.map(function (c, i) {
      var n = pad2(i + 1);
      var back = c.timeline
        ? '<span class="tl">' + c.timeline.map(function (r) {
            return '<span class="tl-row"><span class="tl-y">' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></span>';
          }).join('') + '</span>'
        : '<span class="f-line">' + esc(c.line) + '</span><span class="f-detail">' + esc(c.detail) + '</span>';
      var frontLine = '<span class="f-teaser">' + esc(c.timeline ? c.line : c.teaser) + '</span>';
      return '<li class="flip-wrap" data-reveal data-delay="' + (i % 4 * 80) + '">' +
        '<button class="flip flip-' + esc(c.id) + '" type="button" aria-pressed="false">' +
          '<span class="flip-in">' +
            '<span class="face front">' +
              '<span class="f-top" aria-hidden="true"><span>Bonus ' + n + '</span><span class="f-plus">+</span></span>' +
              '<span class="f-title">' + esc(c.title) + '</span>' + frontLine + '</span>' +
            '<span class="face back" aria-hidden="true">' +
              '<span class="f-top" aria-hidden="true"><span>' + esc(c.title) + '</span><span class="f-plus">−</span></span>' +
              back + '</span>' +
          '</span></button></li>';
    }).join('');
    return '<section class="sec s-beyond" id="beyond" data-track="beyond" aria-labelledby="beyond-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      head(b.label, b.headline, 'beyond-h') +
      '<p class="beyond-hint" data-reveal>' + esc(b.hint) + '</p>' +
      '<ul class="flips">' + cards + '</ul>' +
      '</div></section>';
  }

  function renderContact() {
    var c = S.contact;
    if (!c) return '';
    var rows = c.links.map(function (l) {
      var mail = l.href.indexOf('mailto:') === 0;
      var detail = mail ? l.href.slice(7) : l.href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      return '<li><a class="c-row" href="' + esc(l.href) + '"' + (mail ? '' : ' target="_blank" rel="noopener noreferrer"') + '>' +
        '<span class="c-label">' + esc(l.label) + '</span><span class="c-detail">' + esc(detail) + '</span>' +
        '<span class="c-arr" aria-hidden="true">' + ARROW + '</span>' +
        (mail ? '' : '<span class="sr-only"> (opens in a new tab)</span>') + '</a></li>';
    }).join('');
    var p = S.profile || {};
    return '<section class="sec s-contact" id="contact" data-track="contact" aria-labelledby="contact-h">' +
      '<div class="sec-bg"></div><div class="wrap">' +
      '<header class="sec-head"><div class="sec-meta" data-reveal><p class="label">' + esc(c.label) + '</p>' +
        '<p class="label folio-r" aria-hidden="true">' + esc(p.name) + ' · ' + esc(p.playlist) + '</p></div>' +
        '<h2 class="say" id="contact-h" data-split data-hotdot>' + esc(c.headline) + '</h2></header>' +
      (c.line ? '<p class="contact-line" data-reveal>' + esc(c.line) + '</p>' : '') +
      '<ul class="c-rows" data-reveal>' + rows + '</ul>' +
      '<div class="c-actions" data-reveal>' +
        '<button class="btn btn-sm" id="copy-btn" type="button" data-magnet="6">' + esc(c.copyLabel) + '</button>' +
        '<button class="btn btn-sm" id="replay-btn" type="button" data-magnet="6">' + esc(c.replay) + ' <span class="arr" aria-hidden="true">↑</span></button>' +
      '</div>' +
      '</div></section>';
  }

  /* Build every section, then swap out the plain fallback */
  function initRender() {
    var html = renderCover() + renderAbout() + renderWork() + renderRecord() + renderSkills() + renderBeyond() + renderContact();
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
    $$('.portrait img').forEach(function (img) {
      img.addEventListener('error', function () { img.parentNode.classList.add('failed'); });
      if (img.complete && !img.naturalWidth && img.src) img.parentNode.classList.add('failed');
    });
  }

  /* ==========================================================================
     LETTERS THAT WIGGLE
     ========================================================================== */
  function initSplitLetters() {
    var coverIndex = 0;
    $$('[data-split]').forEach(function (el) {
      var isCover = el.getAttribute('data-split') === 'cover';
      var text = el.textContent;
      var under = el.getAttribute('data-under');
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
        var isUnder = under && word.replace(/[^A-Za-z]/g, '') === under;
        return '<span class="w' + (isUnder ? ' under-word' : '') + '">' + chars + (isUnder ? '<span class="under" aria-hidden="true"></span>' : '') + '</span>';
      }).join(' ');
    });

    /* Index the letters of each heading so neighbours can echo the wiggle */
    $$('.cover-name, h2[data-split]').forEach(function (h) {
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
    if (reduce) { nm.classList.add('done'); emit('dv:named'); return; }
    nm.classList.add('go');
    var total = $$('.ch', nm).length * 60 + 950;
    setTimeout(function () {
      nm.classList.add('done');
      $$('.ch-f', nm).forEach(function (f) { f.classList.add('amb'); });
      emit('dv:named');
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
    var ids = ['top', 'about', 'work', 'record', 'skills', 'beyond', 'contact'];
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

    /* The current section is the last one whose top has passed 40% of the screen.
       Reading section tops (not the sticky cover) keeps this right during the pinned cover. */
    function currentId() {
      var line = window.innerHeight * 0.4, cur = secs[0];
      secs.forEach(function (s) { if (s.id !== 'top' && s.getBoundingClientRect().top <= line) cur = s; });
      return cur ? cur.id : 'top';
    }

    function update() {
      ticking = false;
      var max = root.scrollHeight - window.innerHeight;
      var y = window.scrollY || window.pageYOffset;
      var p = max > 0 ? clamp(y / max, 0, 1) : 0;
      var id = currentId();
      var ended = max > 0 && y >= max - 4;     /* the last track ends at the bottom of the page */
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
    /* One update per frame; the timer covers background tabs where frames pause */
    function request() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { if (ticking) update(); });
      setTimeout(function () { if (ticking) update(); }, 150);
    }
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
      try { track.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
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
    var lastY = window.scrollY || 0;
    function onScroll() {
      var y = window.scrollY || 0;
      nav.classList.toggle('scrolled', y > 80);
      /* Hide the bar while reading down the page; bring it back on any scroll up */
      if (!menu.classList.contains('open')) {
        if (y > lastY + 6 && y > 240) nav.classList.add('nav-hide');
        else if (y < lastY - 6 || y <= 240) nav.classList.remove('nav-hide');
      }
      lastY = y;
    }
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
      if (open) nav.classList.remove('nav-hide');
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
      var c = cssVar('--burgundy');
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
      emit('dv:mood', next.id);
      toast('Mood: ' + next.name, 1600);
    });
  }

  /* ==========================================================================
     SCROLL REVEAL
     ========================================================================== */
  function initReveal() {
    var items = $$('[data-reveal]');
    var unders = $$('.under');
    if (!('IntersectionObserver' in window)) {
      unders.forEach(function (s) { s.classList.add('drawn'); });
      return;
    }
    root.classList.add('reveal-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.style.setProperty('--rd', (parseInt(el.getAttribute('data-delay'), 10) || 0) + 'ms');
        el.classList.add(el.classList.contains('under') ? 'drawn' : 'in');
        io.unobserve(el);
      });
    }, { threshold: 0.15 });
    items.concat(unders).forEach(function (el) { io.observe(el); });
  }

  /* ==========================================================================
     TILT and MAGNETIC hover (mouse only)
     ========================================================================== */
  function initTilt() {
    if (!fine || reduce) return;
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      var target = $('.ph', el) || el;
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
        emit('dv:layout');
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
        var gx = lineX(i), gy = lineY(LINE.data[i]);
        guide.setAttribute('x1', gx); guide.setAttribute('x2', gx);
        txt.textContent = 'Month ' + (i + 1) + ', illustrative';
        tip.setAttribute('transform', 'translate(' + clamp(gx + 8, 2, LINE.w - 130) + ',' + (gy - 34 < 2 ? gy + 12 : gy - 34) + ')');
        viz.classList.add('hovering');
      }
      svg.addEventListener('pointermove', show);
      svg.addEventListener('pointerdown', show);
      svg.addEventListener('pointerleave', function () { viz.classList.remove('hovering'); });
    });

    /* Gallery: thumbnails switch the large view; the large view opens a lightbox */
    visuals.gallery = { start: function () {}, stop: function () {} };
    var box = null, boxImg, boxCap, items = [], at = 0;
    function show(i) {
      at = (i + items.length) % items.length;
      boxImg.src = items[at].src; boxImg.alt = items[at].alt;
      boxCap.textContent = items[at].label + ' \u00b7 ' + (at + 1) + ' of ' + items.length;
    }
    function lightbox(list, i) {
      if (!box) {
        box = doc.createElement('dialog');
        box.className = 'lightbox';
        box.setAttribute('aria-label', 'Dashboard screenshot');
        box.innerHTML = '<img alt=""><p class="lb-cap"></p>' +
          '<button class="lb-btn lb-prev" type="button" aria-label="Previous page">\u2190</button>' +
          '<button class="lb-btn lb-next" type="button" aria-label="Next page">\u2192</button>' +
          '<button class="lb-btn lb-close" type="button" aria-label="Close">\u00d7</button>';
        body.appendChild(box);
        boxImg = $('img', box); boxCap = $('.lb-cap', box);
        $('.lb-prev', box).addEventListener('click', function () { show(at - 1); });
        $('.lb-next', box).addEventListener('click', function () { show(at + 1); });
        $('.lb-close', box).addEventListener('click', function () { box.close(); });
        box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
        box.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowLeft') show(at - 1);
          if (e.key === 'ArrowRight') show(at + 1);
        });
      }
      items = list;
      show(i);
      if (box.showModal) box.showModal(); else window.open(items[i].src, '_blank', 'noopener');
    }
    $$('.gallery').forEach(function (g) {
      var li = g.closest('.trk');
      var proj = (S.work.projects || []).filter(function (p) { return p.id === li.getAttribute('data-id'); })[0];
      var list = proj.gallery, cur = 0;
      var main = $('.gal-main', g), img = $('img', main);
      $$('.gal-thumb', g).forEach(function (t) {
        t.addEventListener('click', function () {
          cur = +t.getAttribute('data-i');
          img.src = list[cur].src; img.alt = list[cur].alt;
          main.setAttribute('aria-label', 'Enlarge: ' + list[cur].label);
          $$('.gal-thumb', g).forEach(function (o) { o.setAttribute('aria-pressed', String(o === t)); });
        });
      });
      main.addEventListener('click', function () { lightbox(list, cur); });
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
     RECORD CRATE: tap a sleeve to pull its record out (hover does it with a mouse)
     ========================================================================== */
  function initCrate() {
    $$('.crate-item').forEach(function (item) {
      $('.sleeve-art', item).addEventListener('click', function () { item.classList.toggle('out'); });
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
     COVER: glow follows the mouse; ambient loops pause when off-screen
     ========================================================================== */
  function initCover() {
    var cover = $('#top');
    if (!cover) return;
    var glow = $('#glow');
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

  /* ==========================================================================
     WOW 1: the name reacts to the cursor (variable font weight, lean, push)
     Each letter's INNER span takes this effect; the OUTER span keeps the wiggle.
     ========================================================================== */
  function initNameWeight() {
    var nm = $('#cover-name'), cover = $('#top');
    if (!nm || !fine || reduce) return;
    var letters = $$('.ch-i', nm);
    var st = letters.map(function () { return { w: 900, r: 0, x: 0, y: 0 }; });
    var px = -9999, py = -9999, running = false, ready = false;

    /* Fix every letter to its width at weight 900, so changing weight never moves neighbours */
    function measure() {
      letters.forEach(function (l) { l.style.width = ''; l.style.fontVariationSettings = "'wght' 900"; });
      letters.forEach(function (l) { l.style.width = l.offsetWidth + 'px'; });
    }
    function frame() {
      var moving = false;
      letters.forEach(function (l, i) {
        var r = l.parentNode.getBoundingClientRect();
        var dx = r.left + r.width / 2 - px, dy = r.top + r.height / 2 - py;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var f = clamp(1 - d / 240, 0, 1);
        var s = st[i];
        var tw = 700 + 200 * f, tr = 8 * f * (dx < 0 ? -1 : 1), tx = 14 * f * dx / d, ty = 14 * f * dy / d;
        s.w = lerp(s.w, tw, 0.15); s.r = lerp(s.r, tr, 0.15); s.x = lerp(s.x, tx, 0.15); s.y = lerp(s.y, ty, 0.15);
        if (Math.abs(s.w - tw) + Math.abs(s.r - tr) + Math.abs(s.x - tx) + Math.abs(s.y - ty) > 0.2) moving = true;
        l.style.fontVariationSettings = "'wght' " + s.w.toFixed(0);
        l.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px) rotate(' + s.r.toFixed(2) + 'deg)';
      });
      if (moving) requestAnimationFrame(frame); else running = false;
    }
    function kick() { if (ready && !running) { running = true; requestAnimationFrame(frame); } }
    function start() {
      measure();
      ready = true;
      kick();     /* eases every letter from 900 down to its resting weight of 700 */
    }
    cover.addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; kick(); }, { passive: true });
    cover.addEventListener('pointerleave', function () { px = py = -9999; kick(); });
    window.addEventListener('resize', function () { if (ready) { measure(); kick(); } });
    var fonts = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
    doc.addEventListener('dv:named', function () { fonts.then(start); });
  }

  /* ==========================================================================
     WOW 2: ink trail on the cover (canvas, pre-rendered soft sprites)
     ========================================================================== */
  function initInk() {
    var canvas = $('#ink'), cover = $('#top');
    if (!canvas || !canvas.getContext || reduce) { if (canvas) canvas.style.display = 'none'; return; }
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0, parts = [], sprites = {}, raf = 0, visible = true, lastMove = 0, lastX = 0, lastY = 0;
    var blobs = [0, 1, 2].map(function (i) { return { a: seeded(i) * 6.28, s: 0.0002 + seeded(i + 9) * 0.0002 }; });

    /* One soft round sprite per colour, drawn once (no per-frame blur) */
    function sprite(color) {
      var c = doc.createElement('canvas'); c.width = c.height = 64;
      var g = c.getContext('2d'), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, color); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
      return c;
    }
    function buildSprites() {
      sprites.rose = sprite(cssVar('--rose') || '#E4AAB9');
      sprites.ivory = sprite(cssVar('--ivory') || '#F7F0EB');
      sprites.hot = sprite(cssVar('--hot') || '#FF4D6D');
    }
    function size() {
      var r = cover.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(x, y, ambient) {
      if (parts.length >= 160) return;
      var roll = seeded(parts.length + x * 0.37 + y);
      var key = roll < 0.08 ? 'hot' : roll < 0.18 ? 'ivory' : 'rose';
      parts.push({
        x: x, y: y, r: ambient ? 26 + Math.random() * 20 : 6 + Math.random() * 16,
        life: ambient ? 2600 : 1200 + Math.random() * 800, age: 0,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25 - 0.05, img: key
      });
    }
    var prev = 0;
    function frame(t) {
      raf = 0;
      if (!visible || state.paused) return;
      var dt = Math.min(50, t - (prev || t)); prev = t;
      /* Idle for 3 seconds: a few slow ambient blobs wander so it never looks dead */
      if (t - lastMove > 3000) {
        blobs.forEach(function (b, i) {
          b.a += b.s * dt;
          if (Math.random() < 0.06) spawn(W * (0.5 + 0.38 * Math.cos(b.a + i * 2)), H * (0.45 + 0.3 * Math.sin(b.a * 1.3 + i)), true);
        });
      }
      ctx.clearRect(0, 0, W, H);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.age += dt;
        if (p.age >= p.life) { parts.splice(i, 1); continue; }
        var k = p.age / p.life;
        p.x += p.vx * dt * 0.06 + Math.sin((p.age + i * 40) * 0.003) * 0.15;
        p.y += p.vy * dt * 0.06;
        var s = p.r * (1 - k * 0.6);
        ctx.globalAlpha = 0.35 * (1 - k);
        ctx.drawImage(sprites[p.img], p.x - s, p.y - s, s * 2, s * 2);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible && !state.paused) { prev = 0; raf = requestAnimationFrame(frame); } }

    buildSprites();
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(cover);
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; kick(); }).observe(cover);
    doc.addEventListener('dv:pause', kick);
    doc.addEventListener('dv:mood', function () { setTimeout(buildSprites, 550); });

    var skip = 0;
    cover.addEventListener('pointermove', function (e) {
      var r = cover.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      var ddx = x - lastX, ddy = y - lastY;
      var speed = Math.sqrt(ddx * ddx + ddy * ddy);
      lastX = x; lastY = y; lastMove = performance.now();
      if (e.pointerType === 'mouse') {
        /* More particles when moving faster, spread along the path just travelled */
        var n = clamp(Math.round(speed / 10), 1, 4);
        for (var i = 0; i < n; i++) spawn(x - ddx * i / n, y - ddy * i / n, false);
      } else if (++skip % 3 === 0) spawn(x, y, false);    /* touch: fewer particles */
      kick();
    }, { passive: true });
  }

  /* ==========================================================================
     WOW 3: the cover pins and shrinks into About (GSAP ScrollTrigger)
     ========================================================================== */
  function initPin() {
    var G = window.gsap, ST = window.ScrollTrigger;
    var wrap = $('#cover-wrap'), cover = $('#top');
    if (!G || !ST || !wrap || reduce || window.innerWidth < 700) return;
    /* Only pin when the whole cover fits on screen */
    if ($('.cover-in', cover).offsetHeight + 120 > window.innerHeight) return;
    root.classList.add('pin-on');
    var tl = G.timeline({ scrollTrigger: { trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true } });
    tl.to('#cover-name', { scale: 0.4, y: -window.innerHeight * 0.08, ease: 'none', duration: 0.7 }, 0)
      .to(['#top .deck', '#top .folio', '#top .cover-base', '#glow'], { opacity: 0, y: -30, ease: 'none', duration: 0.45 }, 0)
      .fromTo('#top .sec-bg',
        { clipPath: 'inset(0vh 0vw 0vh 0vw round 0px)' },
        { clipPath: 'inset(7vh 5vw 7vh 5vw round 36px)', ease: 'none', duration: 0.7 }, 0)
      .to({}, { duration: 0.3 });
  }

  /* ==========================================================================
     WOW 4: magazine-page wipes for section backgrounds, and line-by-line
     headline reveals (GSAP ScrollTrigger)
     ========================================================================== */
  function initWipes() {
    var G = window.gsap, ST = window.ScrollTrigger;
    if (!G || !ST || reduce) return;
    var secs = ['about', 'work', 'record', 'skills', 'beyond', 'contact'].map(function (id) { return doc.getElementById(id); }).filter(Boolean);
    root.classList.add('wipe-ready');
    secs.forEach(function (sec, i) {
      var bg = $('.sec-bg', sec);
      if (i % 2) sec.classList.add('wipe-down');
      if (sec.getBoundingClientRect().top < window.innerHeight * 0.85) return;   /* already on screen: no wipe */
      G.set(bg, { '--w': 100, '--wl': 1 });
      ST.create({
        trigger: sec, start: 'top 85%', once: true,
        onEnter: function () {
          G.to(bg, { '--w': 0, duration: 0.9, ease: 'power3.out', onComplete: function () { G.set(bg, { '--wl': 0 }); } });
        }
      });
    });
    /* Headlines rise word by word from behind a mask */
    $$('.sec .display, .say').forEach(function (h) {
      if (h.getBoundingClientRect().top < window.innerHeight) return;
      h.style.clipPath = 'inset(-20% -5% 0 -5%)';
      G.from($$('.w', h), {
        yPercent: 110, duration: 0.9, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true },
        onComplete: function () { h.style.clipPath = ''; }
      });
    });
    /* Safety net: never leave a background or headline hidden */
    setTimeout(function () {
      secs.forEach(function (sec) {
        if (sec.getBoundingClientRect().top < window.innerHeight * 0.85) G.set($('.sec-bg', sec), { '--w': 0, '--wl': 0 });
      });
    }, 4000);
  }

  /* ==========================================================================
     WOW 5: project preview card that follows the cursor over the tracklist
     ========================================================================== */
  function initPreview() {
    var list = $('#tracks');
    if (!list || !fine || reduce) return;
    var mini = {
      bars: '<div class="pv-bars">' + BARS.slice(2, 12).map(function (v) { return '<i style="height:' + v + '%"></i>'; }).join('') + '</div>',
      line: (function () {
        var pts = LINE.data.map(function (v, i) { return [i * 260 / 23, 120 - (v - 2) * 20]; });
        return '<svg viewBox="0 0 260 130" aria-hidden="true"><path d="' + smoothPath(pts) + '" fill="none" stroke="var(--ivory)" stroke-width="3"/></svg>';
      })(),
      gallery: (function () {
        var sp = (S.work.projects || []).filter(function (p) { return p.gallery; })[0];
        return sp ? '<img class="pv-img" src="' + esc(sp.gallery[0].src) + '" alt="">' : '';
      })(),
      terminal: '<div class="pv-term">&gt; <b>' + esc(S.work.terminal.examples[0].ask) + '</b><br>' + esc(S.work.terminal.examples[0].rows[0].join('  ')) + '</div>'
    };
    var card = doc.createElement('div');
    card.className = 'preview';
    card.setAttribute('aria-hidden', 'true');
    card.innerHTML = '<div class="preview-in">' + $$('.trk', list).map(function (li) {
      var t = $('.trk-title', li).textContent;
      return '<div class="pv" data-id="' + li.getAttribute('data-id') + '"><span class="pv-t">' + esc(t) + '</span>' + (mini[li.getAttribute('data-visual')] || '') + '</div>';
    }).join('') + '</div>';
    body.appendChild(card);

    var x = 0, y = 0, cx = 0, cy = 0, on = false, raf = 0;
    function frame() {
      cx = lerp(cx, x, 0.12); cy = lerp(cy, y, 0.12);
      card.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      if (on || Math.abs(cx - x) + Math.abs(cy - y) > 0.5) raf = requestAnimationFrame(frame); else raf = 0;
    }
    function place(e) {
      var flip = e.clientX + 24 + 280 > window.innerWidth - 16;
      x = flip ? e.clientX - 24 - 280 : e.clientX + 24;
      y = e.clientY - 95;
    }
    $$('.trk-head', list).forEach(function (h) {
      var id = h.closest('.trk').getAttribute('data-id');
      h.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        place(e);
        if (!on) { cx = x; cy = y; }
        on = true;
        card.style.opacity = 1;
        card.classList.add('on');
        $$('.pv', card).forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-id') === id); });
        if (!raf) raf = requestAnimationFrame(frame);
      });
      h.addEventListener('pointermove', place);
      h.addEventListener('pointerleave', function () { on = false; card.classList.remove('on'); });
    });
  }

  /* GSAP housekeeping: refresh once fonts and images settle; clean up on leave */
  function initGsapHousekeeping() {
    var ST = window.ScrollTrigger;
    if (!window.gsap || !ST) return;
    window.gsap.registerPlugin(ST);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { ST.refresh(); });
    window.addEventListener('load', function () { ST.refresh(); });
    doc.addEventListener('dv:layout', function () { setTimeout(function () { ST.refresh(); }, 500); });
    window.addEventListener('pagehide', function () { ST.getAll().forEach(function (t) { t.kill(); }); });
  }

  /* ---------- Start everything (each part fails on its own, never together) ---------- */
  run('initRender', initRender);
  run('initSplitLetters', initSplitLetters);
  run('initCurtain', initCurtain);
  run('initPlayer', initPlayer);
  run('initNav', initNav);
  run('initMood', initMood);
  run('initReveal', initReveal);
  run('initTilt', initTilt);
  run('initMagnet', initMagnet);
  run('initVisuals', initVisuals);
  run('initTerminal', initTerminal);
  run('initProjects', initProjects);
  run('initFlip', initFlip);
  run('initCrate', initCrate);
  run('initCopy', initCopy);
  run('initCover', initCover);
  run('initExplore', initExplore);
  /* The wow layer: optional extras */
  run('initGsapHousekeeping', initGsapHousekeeping);
  run('initNameWeight', initNameWeight);
  run('initInk', initInk);
  run('initPin', initPin);
  run('initWipes', initWipes);
  run('initPreview', initPreview);
})();
